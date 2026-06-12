from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    database_path: Path
    overpass_endpoint: str
    cache_ttl_seconds: int
    cache_grid_degrees: float
    request_timeout_seconds: int


def load_settings() -> Settings:
    backend_dir = Path(__file__).resolve().parents[1]
    default_db_path = backend_dir / "data" / "mapgame.db"

    return Settings(
        database_path=Path(os.environ.get("MAPGAME_DB_PATH", default_db_path)),
        overpass_endpoint=os.environ.get("MAPGAME_OVERPASS_ENDPOINT", "https://overpass-api.de/api/interpreter"),
        cache_ttl_seconds=int(os.environ.get("MAPGAME_CACHE_TTL_SECONDS", str(7 * 24 * 60 * 60))),
        cache_grid_degrees=float(os.environ.get("MAPGAME_CACHE_GRID_DEGREES", "0.02")),
        request_timeout_seconds=int(os.environ.get("MAPGAME_REQUEST_TIMEOUT_SECONDS", "35")),
    )

