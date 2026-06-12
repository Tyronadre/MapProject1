from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PoiCategory:
    label: str
    filters: tuple[str, ...]
    include_in_all: bool = True


@dataclass(frozen=True)
class TransitType:
    label: str
    railway_values: tuple[str, ...]


POI_CATEGORY_ORDER = (
    "airport",
    "rail_station",
    "transit_stop",
    "peak",
    "park",
    "amusement_park",
    "zoo",
    "aquarium",
    "golf_course",
    "museum",
    "cinema",
    "hospital",
    "library",
    "consulate",
    "water",
)

POI_CATEGORIES: dict[str, PoiCategory] = {
    "airport": PoiCategory(
        label="Commercial airport",
        filters=(
            '["aeroway"="aerodrome"]["iata"]',
            '["aeroway"="aerodrome"]["aerodrome:type"~"international|regional|public",i]',
        ),
    ),
    "rail_station": PoiCategory(
        label="Rail station",
        filters=(
            '["railway"="station"]',
            '["public_transport"="station"]["train"="yes"]',
        ),
    ),
    "transit_stop": PoiCategory(
        label="Transit stop",
        filters=(
            '["highway"="bus_stop"]',
            '["railway"="halt"]',
            '["railway"="tram_stop"]',
            '["public_transport"="platform"]',
        ),
        include_in_all=False,
    ),
    "peak": PoiCategory(label="Mountain", filters=('["natural"="peak"]',)),
    "park": PoiCategory(label="Park", filters=('["leisure"="park"]', '["boundary"="protected_area"]')),
    "amusement_park": PoiCategory(label="Amusement park", filters=('["tourism"="theme_park"]',)),
    "zoo": PoiCategory(label="Zoo", filters=('["tourism"="zoo"]',)),
    "aquarium": PoiCategory(label="Aquarium", filters=('["tourism"="aquarium"]',)),
    "golf_course": PoiCategory(label="Golf course", filters=('["leisure"="golf_course"]',)),
    "museum": PoiCategory(label="Museum", filters=('["tourism"="museum"]',)),
    "cinema": PoiCategory(label="Movie theatre", filters=('["amenity"="cinema"]',)),
    "hospital": PoiCategory(label="Hospital", filters=('["amenity"="hospital"]',)),
    "library": PoiCategory(label="Library", filters=('["amenity"="library"]',)),
    "consulate": PoiCategory(
        label="Foreign consulate",
        filters=(
            '["office"="diplomatic"]["diplomatic"~"consulate|consulate_general|honorary_consulate",i]',
            '["amenity"="embassy"]["diplomatic"~"consulate|consulate_general|honorary_consulate",i]',
        ),
    ),
    "water": PoiCategory(
        label="Body of water",
        filters=(
            '["natural"="water"]',
            '["landuse"="reservoir"]',
            '["waterway"="riverbank"]',
        ),
        include_in_all=False,
    ),
}

TRANSIT_TYPE_ORDER = (
    "rail",
    "light_rail",
    "subway",
    "tram",
)

TRANSIT_TYPES: dict[str, TransitType] = {
    "rail": TransitType(label="Regional/Fernbahn", railway_values=("rail",)),
    "light_rail": TransitType(label="S-Bahn/Stadtbahn", railway_values=("light_rail",)),
    "subway": TransitType(label="U-Bahn", railway_values=("subway",)),
    "tram": TransitType(label="Tram", railway_values=("tram",)),
}

TRANSIT_LINE_MODES: dict[str, str] = {
    "train": "Zug",
    "light_rail": "S-Bahn/Stadtbahn",
    "subway": "U-Bahn",
    "tram": "Tram",
}


def expand_poi_categories(category_ids: list[str]) -> list[str]:
    if not category_ids or "all" in category_ids:
        return [category_id for category_id in POI_CATEGORY_ORDER if POI_CATEGORIES[category_id].include_in_all]

    return [category_id for category_id in category_ids if category_id in POI_CATEGORIES]


def expand_transit_types(type_ids: list[str]) -> list[str]:
    if not type_ids or "all" in type_ids:
        return list(TRANSIT_TYPE_ORDER)

    return [type_id for type_id in type_ids if type_id in TRANSIT_TYPES]


def expand_transit_line_selectors(line_ids: list[str]) -> list[str]:
    if not line_ids or "all" in line_ids:
        return ["all"]

    return [line_id.strip() for line_id in line_ids if line_id.strip()]
