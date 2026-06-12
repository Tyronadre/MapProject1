from __future__ import annotations

import time
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .categories import expand_poi_categories, expand_transit_line_selectors, expand_transit_types
from .db import Database
from .geo import cache_key, filter_lines_to_bounds, filter_pois_to_bounds, filter_segments_to_bounds, snap_bounds
from .overpass import (
    build_poi_query,
    build_transit_line_query,
    build_transit_query,
    fetch_overpass_json,
    normalize_pois,
    normalize_transit_lines,
    normalize_transit_segments,
)
from .schemas import (
    AnswerCreate,
    AnswerRecord,
    BoundsUpdate,
    CacheStats,
    GameCreate,
    GameRecord,
    MapDataRequest,
    MapPinsResponse,
    MapTransitLinesResponse,
    MapTransitResponse,
)
from .settings import load_settings


settings = load_settings()
database = Database(settings.database_path)

app = FastAPI(title="IRL Hide and Seek Map Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    database.init()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/games", response_model=GameRecord, status_code=status.HTTP_201_CREATED)
def create_game(payload: GameCreate) -> dict[str, Any]:
    now = now_iso()
    game = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "status": "active",
        "bounds": [point.model_dump() for point in payload.bounds] if payload.bounds else None,
        "created_at": now,
        "updated_at": now,
    }
    return database.create_game(game)


@app.get("/api/games/{game_id}", response_model=GameRecord)
def get_game(game_id: str) -> dict[str, Any]:
    game = database.get_game(game_id)
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="game not found")
    return game


@app.post("/api/games/{game_id}/bounds", response_model=GameRecord)
def update_game_bounds(game_id: str, payload: BoundsUpdate) -> dict[str, Any]:
    game = database.update_game_bounds(
        game_id,
        [point.model_dump() for point in payload.bounds],
        now_iso(),
    )
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="game not found")
    return game


@app.post("/api/games/{game_id}/answers", response_model=AnswerRecord, status_code=status.HTTP_201_CREATED)
def create_answer(game_id: str, payload: AnswerCreate) -> dict[str, Any]:
    if not database.get_game(game_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="game not found")

    answer = {
        "id": str(uuid.uuid4()),
        "game_id": game_id,
        "question_type": payload.question_type,
        "category": payload.category,
        "question_text": payload.question_text,
        "answer": payload.answer,
        "seeker_position": payload.seeker_position.model_dump() if payload.seeker_position else None,
        "payload": payload.payload,
        "created_at": now_iso(),
    }
    return database.create_answer(answer)


@app.get("/api/games/{game_id}/answers", response_model=list[AnswerRecord])
def list_answers(game_id: str) -> list[dict[str, Any]]:
    if not database.get_game(game_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="game not found")
    return database.list_answers(game_id)


@app.delete("/api/games/{game_id}/answers/{answer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_answer(game_id: str, answer_id: str) -> None:
    if not database.delete_answer(game_id, answer_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="answer not found")


@app.post("/api/map/pins", response_model=MapPinsResponse)
def get_map_pins(payload: MapDataRequest) -> dict[str, Any]:
    category_ids = expand_poi_categories(payload.categories)
    if not category_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="no valid pin categories requested")

    snapped_bounds = snap_bounds(payload.bounds, settings.cache_grid_degrees)
    key = cache_key("pins", category_ids, snapped_bounds)
    cached_payload, cache_hit = load_or_fetch_cached_payload(
        key=key,
        data_type="pins",
        query_bounds=snapped_bounds,
        categories=category_ids,
        use_cache=payload.use_cache,
        refresh=payload.refresh,
        fetcher=lambda: {
            "items": normalize_pois(
                fetch_overpass_json(
                    settings.overpass_endpoint,
                    build_poi_query(category_ids, snapped_bounds),
                    settings.request_timeout_seconds,
                ),
                category_ids,
            )
        },
    )

    return {
        "cache_hit": cache_hit,
        "cache_key": key,
        "query_bounds": snapped_bounds.model_dump(),
        "items": filter_pois_to_bounds(cached_payload["items"], payload.bounds),
    }


@app.post("/api/map/transit", response_model=MapTransitResponse)
def get_map_transit(payload: MapDataRequest) -> dict[str, Any]:
    type_ids = expand_transit_types(payload.categories)
    if not type_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="no valid transit types requested")

    snapped_bounds = snap_bounds(payload.bounds, settings.cache_grid_degrees)
    key = cache_key("transit", type_ids, snapped_bounds)
    cached_payload, cache_hit = load_or_fetch_cached_payload(
        key=key,
        data_type="transit",
        query_bounds=snapped_bounds,
        categories=type_ids,
        use_cache=payload.use_cache,
        refresh=payload.refresh,
        fetcher=lambda: {
            "segments": normalize_transit_segments(
                fetch_overpass_json(
                    settings.overpass_endpoint,
                    build_transit_query(type_ids, snapped_bounds),
                    settings.request_timeout_seconds,
                ),
                type_ids,
            )
        },
    )

    return {
        "cache_hit": cache_hit,
        "cache_key": key,
        "query_bounds": snapped_bounds.model_dump(),
        "segments": filter_segments_to_bounds(cached_payload["segments"], payload.bounds),
    }


@app.post("/api/map/transit-lines", response_model=MapTransitLinesResponse)
def get_map_transit_lines(payload: MapDataRequest) -> dict[str, Any]:
    line_selectors = expand_transit_line_selectors(payload.categories)
    if not line_selectors:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="no valid transit lines requested")

    snapped_bounds = snap_bounds(payload.bounds, settings.cache_grid_degrees)
    key = cache_key("transit_lines", line_selectors, snapped_bounds)
    cached_payload, cache_hit = load_or_fetch_cached_payload(
        key=key,
        data_type="transit_lines",
        query_bounds=snapped_bounds,
        categories=line_selectors,
        use_cache=payload.use_cache,
        refresh=payload.refresh,
        fetcher=lambda: {
            "lines": normalize_transit_lines(
                fetch_overpass_json(
                    settings.overpass_endpoint,
                    build_transit_line_query(line_selectors, snapped_bounds),
                    settings.request_timeout_seconds,
                ),
                line_selectors,
            )
        },
    )

    return {
        "cache_hit": cache_hit,
        "cache_key": key,
        "query_bounds": snapped_bounds.model_dump(),
        "lines": filter_lines_to_bounds(cached_payload["lines"], payload.bounds),
    }


@app.get("/api/cache/stats", response_model=CacheStats)
def cache_stats() -> dict[str, int]:
    return database.cache_stats(int(time.time()))


def load_or_fetch_cached_payload(
    *,
    key: str,
    data_type: str,
    query_bounds: Any,
    categories: list[str],
    use_cache: bool,
    refresh: bool,
    fetcher: Any,
) -> tuple[dict[str, Any], bool]:
    now = int(time.time())

    if use_cache and not refresh:
        cached = database.get_cache(key, now)
        if cached:
            return cached["payload"], True

    try:
        payload = fetcher()
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"upstream map data request failed: {exc}") from exc

    database.set_cache(
        key=key,
        data_type=data_type,
        bounds=query_bounds.model_dump(),
        categories=categories,
        payload=payload,
        created_at=now,
        expires_at=now + settings.cache_ttl_seconds,
        source="overpass",
    )
    return payload, False


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
