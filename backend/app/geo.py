from __future__ import annotations

import hashlib
import json
import math
from typing import Any

from .schemas import Bounds


def snap_bounds(bounds: Bounds, grid_degrees: float) -> Bounds:
    return Bounds(
        south=math.floor(bounds.south / grid_degrees) * grid_degrees,
        west=math.floor(bounds.west / grid_degrees) * grid_degrees,
        north=math.ceil(bounds.north / grid_degrees) * grid_degrees,
        east=math.ceil(bounds.east / grid_degrees) * grid_degrees,
    )


def cache_key(data_type: str, categories: list[str], bounds: Bounds) -> str:
    payload = {
        "data_type": data_type,
        "categories": sorted(categories),
        "bounds": bounds.model_dump(),
    }
    digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()
    return f"{data_type}:{digest[:24]}"


def point_in_bounds(lat: float, lng: float, bounds: Bounds) -> bool:
    return bounds.south <= lat <= bounds.north and bounds.west <= lng <= bounds.east


def filter_pois_to_bounds(items: list[dict[str, Any]], bounds: Bounds) -> list[dict[str, Any]]:
    return [item for item in items if point_in_bounds(float(item["lat"]), float(item["lng"]), bounds)]


def filter_segments_to_bounds(segments: list[dict[str, Any]], bounds: Bounds) -> list[dict[str, Any]]:
    filtered: list[dict[str, Any]] = []

    for segment in segments:
        coordinates = segment.get("coordinates", [])
        if any(point_in_bounds(float(lat), float(lng), bounds) for lat, lng in coordinates):
            filtered.append(segment)

    return filtered


def filter_lines_to_bounds(lines: list[dict[str, Any]], bounds: Bounds) -> list[dict[str, Any]]:
    filtered: list[dict[str, Any]] = []

    for line in lines:
        paths = line.get("paths", [])
        stations = line.get("stations", [])
        path_matches = any(
            point_in_bounds(float(lat), float(lng), bounds)
            for path in paths
            for lat, lng in path
        )
        station_matches = any(
            point_in_bounds(float(station["lat"]), float(station["lng"]), bounds)
            for station in stations
        )

        if path_matches or station_matches:
            filtered.append(line)

    return filtered
