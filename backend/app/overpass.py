from __future__ import annotations

import json
import re
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from .categories import POI_CATEGORIES, TRANSIT_LINE_MODES, TRANSIT_TYPES
from .schemas import Bounds


def fetch_overpass_json(endpoint: str, query: str, timeout_seconds: int) -> dict[str, Any]:
    body = urllib.parse.urlencode({"data": query}).encode("utf-8")
    request = urllib.request.Request(
        endpoint,
        data=body,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "User-Agent": "mapgame-backend/0.1",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace").strip()
        summary = " ".join(detail.split())
        if len(summary) > 500:
            summary = f"{summary[:500]}..."
        raise RuntimeError(f"Overpass HTTP {exc.code} {exc.reason}: {summary or 'no response body'}") from exc


def build_poi_query(category_ids: list[str], bounds: Bounds) -> str:
    bbox = format_bbox(bounds)
    fragments: list[str] = []

    for category_id in category_ids:
        for tag_filter in POI_CATEGORIES[category_id].filters:
            fragments.append(f"node{tag_filter}({bbox});")
            fragments.append(f"way{tag_filter}({bbox});")
            fragments.append(f"relation{tag_filter}({bbox});")

    return f"""[out:json][timeout:25];
(
  {chr(10).join(fragments)}
);
out center tags;"""


def build_transit_query(type_ids: list[str], bounds: Bounds) -> str:
    bbox = format_bbox(bounds)
    fragments: list[str] = []

    for type_id in type_ids:
        for railway_value in TRANSIT_TYPES[type_id].railway_values:
            fragments.append(
                f'way["railway"="{railway_value}"]["service"!~"yard|siding|spur|crossover"]["usage"!~"industrial|military"]({bbox});'
            )

    return f"""[out:json][timeout:30];
(
  {chr(10).join(fragments)}
);
out geom tags;"""


def build_transit_line_query(line_selectors: list[str], bounds: Bounds) -> str:
    bbox = format_bbox(bounds)
    selectors = parse_line_selectors(line_selectors)
    route_regex = "|".join(TRANSIT_LINE_MODES.keys())

    if selectors == [("all", "all")]:
        fragments = [
            f'relation["type"="route"]["route"~"^({route_regex})$"]({bbox});'
        ]
    else:
        fragments = []
        for mode, ref in selectors:
            ref_filter = f'["ref"~"^{build_ref_regex(ref)}$",i]' if ref != "all" else ""
            if mode == "all":
                fragments.append(
                    f'relation["type"="route"]["route"~"^({route_regex})$"]{ref_filter}({bbox});'
                )
            else:
                fragments.append(f'relation["type"="route"]["route"="{mode}"]{ref_filter}({bbox});')

    return f"""[out:json][timeout:40];
(
  {chr(10).join(fragments)}
)->.routes;
.routes out body;
way(r.routes)({bbox})->.routeWays;
node(r.routes)({bbox})->.routeNodes;
relation(r.routes)({bbox})->.routeRelations;
.routeWays out body geom;
.routeNodes out body;
.routeRelations out body center;"""


def normalize_pois(data: dict[str, Any], requested_category_ids: list[str]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []

    for element in data.get("elements", []):
        item = normalize_poi_element(element, requested_category_ids)
        if item:
            items.append(item)

    return items


def normalize_poi_element(element: dict[str, Any], requested_category_ids: list[str]) -> dict[str, Any] | None:
    tags = element.get("tags") or {}
    latlng = element_latlng(element)

    if not latlng:
        return None

    category_id = infer_poi_category(tags, requested_category_ids)
    if not category_id:
        return None

    category = POI_CATEGORIES[category_id]

    return {
        "id": f"{category_id}/{element.get('type')}/{element.get('id')}",
        "category": category_id,
        "name": tags.get("name") or tags.get("name:de") or tags.get("name:en") or category.label,
        "lat": latlng["lat"],
        "lng": latlng["lng"],
        "osm_id": f"{element.get('type')}/{element.get('id')}",
        "source": "osm",
    }


def normalize_transit_segments(data: dict[str, Any], requested_type_ids: list[str]) -> list[dict[str, Any]]:
    segments: list[dict[str, Any]] = []

    for element in data.get("elements", []):
        segment = normalize_transit_way(element, requested_type_ids)
        if segment:
            segments.append(segment)

    return segments


def normalize_transit_lines(data: dict[str, Any], requested_line_selectors: list[str]) -> list[dict[str, Any]]:
    elements = data.get("elements", [])
    element_index = {
        (element.get("type"), element.get("id")): element
        for element in elements
        if element.get("type") and element.get("id") is not None
    }
    selectors = parse_line_selectors(requested_line_selectors)
    lines_by_ref: dict[str, dict[str, Any]] = {}

    for relation in elements:
        if relation.get("type") != "relation":
            continue

        tags = relation.get("tags") or {}
        mode = str(tags.get("route") or "")
        if mode not in TRANSIT_LINE_MODES:
            continue

        ref = normalize_line_ref(tags.get("ref", ""))
        if not ref:
            ref = normalize_line_ref(tags.get("name", f"relation/{relation.get('id')}"))

        if not line_matches_selectors(mode, ref, selectors):
            continue

        line_id = f"{mode}:{ref}"
        line = lines_by_ref.setdefault(
            line_id,
            {
                "id": line_id,
                "ref": ref,
                "mode": mode,
                "mode_label": TRANSIT_LINE_MODES[mode],
                "name": tags.get("name") or ref,
                "network": tags.get("network") or "",
                "operator": tags.get("operator") or "",
                "routes": [],
                "paths": [],
                "stations": [],
                "_path_ids": set(),
                "_station_ids": set(),
            },
        )
        line["routes"].append(f"relation/{relation.get('id')}")

        if not line["network"] and tags.get("network"):
            line["network"] = tags["network"]
        if not line["operator"] and tags.get("operator"):
            line["operator"] = tags["operator"]

        for member in relation.get("members", []):
            member_element = element_index.get((member.get("type"), member.get("ref")))
            role = str(member.get("role") or "")

            if member.get("type") == "way":
                geometry = extract_geometry(member_element or member)
                path_key = member_identity(member, geometry)
                if len(geometry) >= 2 and not is_station_role(role) and path_key not in line["_path_ids"]:
                    line["_path_ids"].add(path_key)
                    line["paths"].append(geometry)

            if is_station_role(role):
                station = station_from_member(member, member_element)
                station_key = station_identity(station) if station else None
                if station and station_key not in line["_station_ids"]:
                    line["_station_ids"].add(station_key)
                    line["stations"].append(station)

    result = []
    for line in sorted(lines_by_ref.values(), key=transit_line_sort_key):
        line.pop("_path_ids", None)
        line.pop("_station_ids", None)
        result.append(line)

    return result


def normalize_transit_way(element: dict[str, Any], requested_type_ids: list[str]) -> dict[str, Any] | None:
    if element.get("type") != "way" or len(element.get("geometry") or []) < 2:
        return None

    tags = element.get("tags") or {}
    type_id = infer_transit_type(tags, requested_type_ids)

    if not type_id:
        return None

    coordinates = [
        (float(point["lat"]), float(point["lon"]))
        for point in element.get("geometry", [])
        if "lat" in point and "lon" in point
    ]

    if len(coordinates) < 2:
        return None

    transit_type = TRANSIT_TYPES[type_id]

    return {
        "id": f"{type_id}/way/{element.get('id')}",
        "type": type_id,
        "name": tags.get("name") or tags.get("ref") or tags.get("railway:ref") or transit_type.label,
        "ref": tags.get("ref") or tags.get("railway:ref") or "",
        "operator": tags.get("operator") or tags.get("network") or "",
        "usage": tags.get("usage") or "",
        "coordinates": coordinates,
        "osm_id": f"way/{element.get('id')}",
    }


def normalize_line_ref(value: str) -> str:
    return str(value).upper().replace(" ", "")


def parse_line_selectors(line_selectors: list[str]) -> list[tuple[str, str]]:
    if not line_selectors or "all" in line_selectors:
        return [("all", "all")]

    selectors: list[tuple[str, str]] = []
    for selector in line_selectors:
        raw_selector = str(selector).strip()
        if not raw_selector:
            continue

        if ":" in raw_selector:
            mode, ref = raw_selector.split(":", 1)
            selectors.append((mode.strip(), normalize_line_ref(ref)))
        else:
            selectors.append(("all", normalize_line_ref(raw_selector)))

    return selectors or [("all", "all")]


def line_matches_selectors(mode: str, ref: str, selectors: list[tuple[str, str]]) -> bool:
    if selectors == [("all", "all")]:
        return True

    return any(
        (selector_mode == "all" or selector_mode == mode) and
        (selector_ref == "all" or selector_ref == ref)
        for selector_mode, selector_ref in selectors
    )


def build_ref_regex(ref: str) -> str:
    compact_ref = normalize_line_ref(ref)
    match = re.fullmatch(r"([A-Z]+)([0-9].*)", compact_ref)

    if match:
        letters, suffix = match.groups()
        return f"{re.escape(letters)} ?{re.escape(suffix)}"

    return re.escape(ref).replace(r"\ ", " ?")


def transit_line_sort_key(line: dict[str, Any]) -> tuple[int, str]:
    mode_order = {
        "train": 0,
        "light_rail": 1,
        "subway": 2,
        "tram": 3,
    }
    return (mode_order.get(str(line.get("mode")), 99), natural_ref_key(str(line.get("ref"))))


def natural_ref_key(ref: str) -> str:
    return re.sub(r"\d+", lambda match: match.group(0).zfill(4), ref)


def extract_geometry(element: dict[str, Any] | None) -> list[tuple[float, float]]:
    if not element:
        return []

    return [
        (float(point["lat"]), float(point["lon"]))
        for point in element.get("geometry", [])
        if "lat" in point and "lon" in point
    ]


def is_station_role(role: str) -> bool:
    normalized = role.lower()
    return "stop" in normalized or "platform" in normalized or "station" in normalized


def station_from_member(member: dict[str, Any], element: dict[str, Any] | None) -> dict[str, Any] | None:
    source = element or member
    latlng = element_latlng(source)

    if not latlng:
        geometry = extract_geometry(source)
        if geometry:
            lat = sum(point[0] for point in geometry) / len(geometry)
            lng = sum(point[1] for point in geometry) / len(geometry)
            latlng = {"lat": lat, "lng": lng}

    if not latlng:
        return None

    tags = source.get("tags") or {}
    osm_type = member.get("type") or source.get("type")
    osm_id = member.get("ref") or source.get("id")

    return {
        "id": f"{osm_type}/{osm_id}",
        "name": tags.get("name") or tags.get("name:de") or tags.get("name:en") or "Station",
        "lat": latlng["lat"],
        "lng": latlng["lng"],
        "role": str(member.get("role") or ""),
        "osm_id": f"{osm_type}/{osm_id}",
    }


def station_identity(station: dict[str, Any]) -> str:
    name = str(station.get("name") or "").strip().lower()
    if name and name != "station":
        return name

    return str(station.get("id"))


def member_identity(member: dict[str, Any], geometry: list[tuple[float, float]]) -> str:
    member_type = member.get("type")
    member_ref = member.get("ref")
    if member_type and member_ref is not None:
        return f"{member_type}/{member_ref}"

    return json.dumps(geometry, separators=(",", ":"))


def format_bbox(bounds: Bounds) -> str:
    return f"{bounds.south:.6f},{bounds.west:.6f},{bounds.north:.6f},{bounds.east:.6f}"


def element_latlng(element: dict[str, Any]) -> dict[str, float] | None:
    if isinstance(element.get("lat"), (int, float)) and isinstance(element.get("lon"), (int, float)):
        return {"lat": float(element["lat"]), "lng": float(element["lon"])}

    center = element.get("center")
    if isinstance(center, dict) and isinstance(center.get("lat"), (int, float)) and isinstance(center.get("lon"), (int, float)):
        return {"lat": float(center["lat"]), "lng": float(center["lon"])}

    return None


def infer_poi_category(tags: dict[str, Any], requested_category_ids: list[str]) -> str | None:
    for category_id in requested_category_ids:
        if matches_poi_category(category_id, tags):
            return category_id

    return None


def matches_poi_category(category_id: str, tags: dict[str, Any]) -> bool:
    if category_id == "airport":
        return tags.get("aeroway") == "aerodrome" and bool(
            tags.get("iata") or re.search("international|regional|public", str(tags.get("aerodrome:type", "")), re.I)
        )
    if category_id == "rail_station":
        return tags.get("railway") == "station" or (tags.get("public_transport") == "station" and tags.get("train") == "yes")
    if category_id == "transit_stop":
        return tags.get("highway") == "bus_stop" or tags.get("railway") in {"halt", "tram_stop"} or tags.get("public_transport") == "platform"
    if category_id == "peak":
        return tags.get("natural") == "peak"
    if category_id == "park":
        return tags.get("leisure") == "park" or tags.get("boundary") == "protected_area"
    if category_id == "amusement_park":
        return tags.get("tourism") == "theme_park"
    if category_id == "zoo":
        return tags.get("tourism") == "zoo"
    if category_id == "aquarium":
        return tags.get("tourism") == "aquarium"
    if category_id == "golf_course":
        return tags.get("leisure") == "golf_course"
    if category_id == "museum":
        return tags.get("tourism") == "museum"
    if category_id == "cinema":
        return tags.get("amenity") == "cinema"
    if category_id == "hospital":
        return tags.get("amenity") == "hospital"
    if category_id == "library":
        return tags.get("amenity") == "library"
    if category_id == "consulate":
        return (tags.get("office") == "diplomatic" or tags.get("amenity") == "embassy") and bool(
            re.search("consulate|consulate_general|honorary_consulate", str(tags.get("diplomatic", "")), re.I)
        )
    if category_id == "water":
        return tags.get("natural") == "water" or tags.get("landuse") == "reservoir" or tags.get("waterway") == "riverbank"

    return False


def infer_transit_type(tags: dict[str, Any], requested_type_ids: list[str]) -> str | None:
    for type_id in requested_type_ids:
        if tags.get("railway") in TRANSIT_TYPES[type_id].railway_values:
            return type_id

    return None
