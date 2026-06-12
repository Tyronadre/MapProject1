from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


class Bounds(BaseModel):
    south: float
    west: float
    north: float
    east: float

    @field_validator("north")
    @classmethod
    def north_must_be_greater_than_south(cls, value: float, info: Any) -> float:
        south = info.data.get("south")
        if south is not None and value <= south:
            raise ValueError("north must be greater than south")
        return value

    @field_validator("east")
    @classmethod
    def east_must_be_greater_than_west(cls, value: float, info: Any) -> float:
        west = info.data.get("west")
        if west is not None and value <= west:
            raise ValueError("east must be greater than west")
        return value


class LatLng(BaseModel):
    lat: float
    lng: float


class GameCreate(BaseModel):
    name: str = Field(default="Game", min_length=1, max_length=120)
    bounds: list[LatLng] | None = None


class GameRecord(BaseModel):
    id: str
    name: str
    status: str
    bounds: list[LatLng] | None
    created_at: str
    updated_at: str


class BoundsUpdate(BaseModel):
    bounds: list[LatLng] = Field(min_length=3)


class AnswerCreate(BaseModel):
    question_type: str = Field(min_length=1, max_length=80)
    category: str | None = Field(default=None, max_length=80)
    question_text: str | None = Field(default=None, max_length=400)
    answer: str = Field(min_length=1, max_length=120)
    seeker_position: LatLng | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


class AnswerRecord(AnswerCreate):
    id: str
    game_id: str
    created_at: str


class MapDataRequest(BaseModel):
    bounds: Bounds
    categories: list[str] = Field(default_factory=lambda: ["all"])
    use_cache: bool = True
    refresh: bool = False


class PoiItem(BaseModel):
    id: str
    category: str
    name: str
    lat: float
    lng: float
    osm_id: str | None = None
    source: Literal["osm", "manual"] = "osm"


class TransitSegment(BaseModel):
    id: str
    type: str
    name: str
    ref: str = ""
    operator: str = ""
    usage: str = ""
    coordinates: list[tuple[float, float]]
    osm_id: str | None = None


class TransitStation(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    role: str = ""
    osm_id: str | None = None


class TransitLine(BaseModel):
    id: str
    ref: str
    mode: str = ""
    mode_label: str = ""
    name: str
    network: str = ""
    operator: str = ""
    routes: list[str] = Field(default_factory=list)
    paths: list[list[tuple[float, float]]] = Field(default_factory=list)
    stations: list[TransitStation] = Field(default_factory=list)


class MapPinsResponse(BaseModel):
    cache_hit: bool
    cache_key: str
    query_bounds: Bounds
    items: list[PoiItem]


class MapTransitResponse(BaseModel):
    cache_hit: bool
    cache_key: str
    query_bounds: Bounds
    segments: list[TransitSegment]


class MapTransitLinesResponse(BaseModel):
    cache_hit: bool
    cache_key: str
    query_bounds: Bounds
    lines: list[TransitLine]


class CacheStats(BaseModel):
    entries: int
    pins_entries: int
    transit_entries: int
    transit_line_entries: int
    expired_entries: int
