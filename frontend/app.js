const STORAGE_KEY = "irl-hide-seek-map-state-v1";
const DEFAULT_VIEW = {
  center: [52.520008, 13.404954],
  zoom: 12,
};
const FRANKFURT_RMV_BOUNDS = [
  [49.92, 8.28],
  [50.28, 8.98],
];
const BACKEND_API_BASE_URL = localStorage.getItem("mapgame_backend_url") || "http://127.0.0.1:8000";
const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const MAX_POIS_ON_MAP = 1200;
const MAX_TRANSIT_LINES_ON_MAP = 300;
const MAX_ALL_QUERY_AREA_KM2 = 900;
const MAX_SINGLE_QUERY_AREA_KM2 = 5000;
const MAX_TRANSIT_QUERY_AREA_KM2 = 3200;
const POI_CATEGORY_ORDER = [
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
];
const POI_CATEGORIES = {
  airport: {
    label: "Commercial airport",
    shortLabel: "AIR",
    color: "#0f766e",
    includeInAll: true,
    filters: [
      '["aeroway"="aerodrome"]["iata"]',
      '["aeroway"="aerodrome"]["aerodrome:type"~"international|regional|public",i]',
    ],
  },
  rail_station: {
    label: "Rail station",
    shortLabel: "RAIL",
    color: "#2563eb",
    includeInAll: true,
    filters: [
      '["railway"="station"]',
      '["public_transport"="station"]["train"="yes"]',
    ],
  },
  transit_stop: {
    label: "Transit stop",
    shortLabel: "STOP",
    color: "#7c3aed",
    includeInAll: false,
    filters: [
      '["highway"="bus_stop"]',
      '["railway"="halt"]',
      '["railway"="tram_stop"]',
      '["public_transport"="platform"]',
    ],
  },
  peak: {
    label: "Mountain",
    shortLabel: "MTN",
    color: "#854d0e",
    includeInAll: true,
    filters: ['["natural"="peak"]'],
  },
  park: {
    label: "Park",
    shortLabel: "PARK",
    color: "#15803d",
    includeInAll: true,
    filters: [
      '["leisure"="park"]',
      '["boundary"="protected_area"]',
    ],
  },
  amusement_park: {
    label: "Amusement park",
    shortLabel: "FUN",
    color: "#db2777",
    includeInAll: true,
    filters: ['["tourism"="theme_park"]'],
  },
  zoo: {
    label: "Zoo",
    shortLabel: "ZOO",
    color: "#16a34a",
    includeInAll: true,
    filters: ['["tourism"="zoo"]'],
  },
  aquarium: {
    label: "Aquarium",
    shortLabel: "AQU",
    color: "#0284c7",
    includeInAll: true,
    filters: ['["tourism"="aquarium"]'],
  },
  golf_course: {
    label: "Golf course",
    shortLabel: "GOLF",
    color: "#65a30d",
    includeInAll: true,
    filters: ['["leisure"="golf_course"]'],
  },
  museum: {
    label: "Museum",
    shortLabel: "MUS",
    color: "#9333ea",
    includeInAll: true,
    filters: ['["tourism"="museum"]'],
  },
  cinema: {
    label: "Movie theatre",
    shortLabel: "FILM",
    color: "#c026d3",
    includeInAll: true,
    filters: ['["amenity"="cinema"]'],
  },
  hospital: {
    label: "Hospital",
    shortLabel: "HOSP",
    color: "#dc2626",
    includeInAll: true,
    filters: ['["amenity"="hospital"]'],
  },
  library: {
    label: "Library",
    shortLabel: "LIB",
    color: "#0891b2",
    includeInAll: true,
    filters: ['["amenity"="library"]'],
  },
  consulate: {
    label: "Foreign consulate",
    shortLabel: "CON",
    color: "#475569",
    includeInAll: true,
    filters: [
      '["office"="diplomatic"]["diplomatic"~"consulate|consulate_general|honorary_consulate",i]',
      '["amenity"="embassy"]["diplomatic"~"consulate|consulate_general|honorary_consulate",i]',
    ],
  },
  water: {
    label: "Body of water",
    shortLabel: "WTR",
    color: "#0ea5e9",
    includeInAll: false,
    filters: [
      '["natural"="water"]',
      '["landuse"="reservoir"]',
      '["waterway"="riverbank"]',
    ],
  },
};
const TRANSIT_LINE_PALETTE = [
  "#0f766e",
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#7c3aed",
  "#dc2626",
  "#0891b2",
  "#c026d3",
  "#475569",
  "#65a30d",
  "#d97706",
  "#0369a1",
];
const TRANSIT_MODE_LABELS = {
  train: "Zug",
  light_rail: "S-Bahn/Stadtbahn",
  subway: "U-Bahn",
  tram: "Tram",
};

const ui = {
  statusText: document.querySelector("#statusText"),
  modeText: document.querySelector("#modeText"),
  mapStatus: document.querySelector("#mapStatus"),
  areaValue: document.querySelector("#areaValue"),
  pointCountValue: document.querySelector("#pointCountValue"),
  zoomValue: document.querySelector("#zoomValue"),
  poiCountValue: document.querySelector("#poiCountValue"),
  transitCountValue: document.querySelector("#transitCountValue"),
  stationCountValue: document.querySelector("#stationCountValue"),
  seekerValue: document.querySelector("#seekerValue"),
  locateBtn: document.querySelector("#locateBtn"),
  fitBoundsBtn: document.querySelector("#fitBoundsBtn"),
  drawBoundaryBtn: document.querySelector("#drawBoundaryBtn"),
  finishBoundaryBtn: document.querySelector("#finishBoundaryBtn"),
  cancelBoundaryBtn: document.querySelector("#cancelBoundaryBtn"),
  setSeekerBtn: document.querySelector("#setSeekerBtn"),
  poiCategory: document.querySelector("#poiCategory"),
  poiCategoryCount: document.querySelector("#poiCategoryCount"),
  loadPinsBtn: document.querySelector("#loadPinsBtn"),
  setManualPinBtn: document.querySelector("#setManualPinBtn"),
  togglePinsBtn: document.querySelector("#togglePinsBtn"),
  clearPinsBtn: document.querySelector("#clearPinsBtn"),
  pinLegend: document.querySelector("#pinLegend"),
  transitType: document.querySelector("#transitType"),
  transitTypeCount: document.querySelector("#transitTypeCount"),
  focusRmvBtn: document.querySelector("#focusRmvBtn"),
  loadTransitBtn: document.querySelector("#loadTransitBtn"),
  toggleTransitBtn: document.querySelector("#toggleTransitBtn"),
  clearTransitBtn: document.querySelector("#clearTransitBtn"),
  transitLegend: document.querySelector("#transitLegend"),
  radarDistance: document.querySelector("#radarDistance"),
  previewRadarBtn: document.querySelector("#previewRadarBtn"),
  clearRadarBtn: document.querySelector("#clearRadarBtn"),
  clearGameBtn: document.querySelector("#clearGameBtn"),
};

let map;
let savedState;
let isDrawingBoundary = false;
let isSettingSeeker = false;
let boundaryPoints = [];
let draftLayer = null;
let boundaryLayer = null;
let searchAreaLayer = null;
let seekerMarker = null;
let accuracyLayer = null;
let radarLayer = null;
let draftMarkers = [];
let transitLayer = null;
let transitStationLayer = null;
let transitRenderer = null;
let transitLines = [];
let transitVisible = true;
let poiLayer = null;
let poiRenderer = null;
let pois = [];
let pinsVisible = true;
let isSettingPoi = false;

document.addEventListener("DOMContentLoaded", init);

function init() {
  if (!window.L) {
    showMapFallback();
    setStatus("Kartenbibliothek nicht geladen", "Offline");
    return;
  }

  savedState = loadState();

  map = L.map("map", {
    zoomControl: false,
    preferCanvas: true,
  }).setView(savedState.view?.center ?? DEFAULT_VIEW.center, savedState.view?.zoom ?? DEFAULT_VIEW.zoom);

  L.control.zoom({ position: "bottomright" }).addTo(map);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  transitRenderer = L.canvas({ padding: 0.5 });
  transitLayer = L.layerGroup().addTo(map);
  transitStationLayer = L.layerGroup().addTo(map);
  poiRenderer = L.canvas({ padding: 0.5 });
  poiLayer = L.layerGroup().addTo(map);

  map.on("click", handleMapClick);
  map.on("zoomend moveend", persistView);
  map.on("zoomend", () => updateStats());
  map.on("locationfound", handleLocationFound);
  map.on("locationerror", handleLocationError);

  bindControls();
  restoreSavedLayers(savedState);
  updateStats();
  setStatus("Bereit", "OSM");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function bindControls() {
  ui.locateBtn.addEventListener("click", locateSeeker);
  ui.fitBoundsBtn.addEventListener("click", fitGameView);
  ui.drawBoundaryBtn.addEventListener("click", toggleBoundaryDrawing);
  ui.finishBoundaryBtn.addEventListener("click", finishBoundary);
  ui.cancelBoundaryBtn.addEventListener("click", cancelBoundaryDraft);
  ui.setSeekerBtn.addEventListener("click", toggleSeekerPlacement);
  ui.poiCategory.addEventListener("change", renderPoiMarkers);
  ui.loadPinsBtn.addEventListener("click", loadPins);
  ui.setManualPinBtn.addEventListener("click", toggleManualPinPlacement);
  ui.togglePinsBtn.addEventListener("click", togglePins);
  ui.clearPinsBtn.addEventListener("click", clearPins);
  ui.transitType.addEventListener("change", renderTransitLines);
  ui.focusRmvBtn.addEventListener("click", focusRmvArea);
  ui.loadTransitBtn.addEventListener("click", loadTransitLines);
  ui.toggleTransitBtn.addEventListener("click", toggleTransitLines);
  ui.clearTransitBtn.addEventListener("click", clearTransitLines);
  ui.previewRadarBtn.addEventListener("click", previewRadar);
  ui.clearRadarBtn.addEventListener("click", clearRadar);
  ui.clearGameBtn.addEventListener("click", clearGame);
}

function handleMapClick(event) {
  if (isDrawingBoundary) {
    addBoundaryPoint(event.latlng);
    return;
  }

  if (isSettingSeeker) {
    placeSeeker(event.latlng);
    setSeekerPlacement(false);
    return;
  }

  if (isSettingPoi) {
    addManualPoi(event.latlng);
  }
}

function toggleBoundaryDrawing() {
  setSeekerPlacement(false);
  setManualPinPlacement(false);
  isDrawingBoundary = !isDrawingBoundary;

  if (isDrawingBoundary) {
    clearBoundary();
    boundaryPoints = [];
    clearDraftMarkers();
    setStatus("Grenze zeichnen aktiv", "Zeichnen");
  } else {
    cancelBoundaryDraft();
  }

  updateControls();
  updateStats();
}

function addBoundaryPoint(latlng) {
  boundaryPoints.push(latlng);

  const marker = L.marker(latlng, {
    icon: L.divIcon({
      className: "",
      html: '<span class="draft-marker"></span>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    }),
    interactive: false,
  }).addTo(map);

  draftMarkers.push(marker);
  renderDraftBoundary();
  setStatus(`${boundaryPoints.length} Grenzpunkte gesetzt`, "Zeichnen");
  updateControls();
  updateStats();
}

function renderDraftBoundary() {
  if (draftLayer) {
    map.removeLayer(draftLayer);
  }

  if (boundaryPoints.length < 2) {
    draftLayer = null;
    return;
  }

  draftLayer = L.polyline(boundaryPoints, {
    color: "#2563eb",
    dashArray: "8 7",
    opacity: 0.9,
    weight: 3,
  }).addTo(map);
}

function finishBoundary() {
  if (boundaryPoints.length < 3) {
    setStatus("Mindestens 3 Grenzpunkte", "Zeichnen");
    return;
  }

  setBoundary(boundaryPoints);
  clearDraft();
  isDrawingBoundary = false;
  saveState();
  fitGameView();
  setStatus("Spielgrenze gesetzt", "OSM");
  updateControls();
  updateStats();
}

function cancelBoundaryDraft() {
  clearDraft();
  boundaryPoints = [];
  isDrawingBoundary = false;
  setStatus("Bereit", "OSM");
  updateControls();
  updateStats();
}

function setBoundary(points) {
  clearBoundary();

  const latlngs = points.map((point) => L.latLng(point.lat, point.lng));

  searchAreaLayer = L.polygon(latlngs, {
    color: "#138a63",
    fillColor: "#138a63",
    fillOpacity: 0.15,
    opacity: 0.85,
    weight: 2,
  }).addTo(map);

  boundaryLayer = L.polygon(latlngs, {
    color: "#2563eb",
    fill: false,
    opacity: 0.95,
    weight: 3,
  }).addTo(map);

  boundaryPoints = latlngs;
  renderPoiMarkers();
  renderTransitLines();
}

function clearBoundary() {
  if (boundaryLayer) {
    map.removeLayer(boundaryLayer);
    boundaryLayer = null;
  }

  if (searchAreaLayer) {
    map.removeLayer(searchAreaLayer);
    searchAreaLayer = null;
  }

  boundaryPoints = [];
  renderPoiMarkers();
  renderTransitLines();
}

function clearDraft() {
  if (draftLayer) {
    map.removeLayer(draftLayer);
    draftLayer = null;
  }

  clearDraftMarkers();
}

function clearDraftMarkers() {
  draftMarkers.forEach((marker) => marker.remove());
  draftMarkers = [];
}

function toggleSeekerPlacement() {
  setSeekerPlacement(!isSettingSeeker);
}

function setSeekerPlacement(active) {
  isSettingSeeker = active;

  if (active) {
    isDrawingBoundary = false;
    setManualPinPlacement(false);
    clearDraft();
    setStatus("Sucherposition setzen", "Position");
  } else if (!isDrawingBoundary) {
    setStatus("Bereit", "OSM");
  }

  updateControls();
}

function locateSeeker() {
  setStatus("GPS wird abgefragt", "Position");
  map.locate({
    enableHighAccuracy: true,
    maxZoom: 16,
    setView: true,
    timeout: 10000,
  });
}

function handleLocationFound(event) {
  placeSeeker(event.latlng);

  if (accuracyLayer) {
    map.removeLayer(accuracyLayer);
  }

  accuracyLayer = L.circle(event.latlng, {
    radius: event.accuracy,
    color: "#ea580c",
    fillColor: "#ea580c",
    fillOpacity: 0.08,
    opacity: 0.35,
    weight: 1,
  }).addTo(map);

  setStatus("Position gefunden", "OSM");
}

function handleLocationError() {
  setStatus("GPS nicht verfuegbar", "OSM");
}

function placeSeeker(latlng) {
  const point = L.latLng(latlng.lat, latlng.lng);

  if (seekerMarker) {
    seekerMarker.setLatLng(point);
  } else {
    seekerMarker = L.marker(point, {
      icon: L.divIcon({
        className: "",
        html: '<span class="seeker-marker"></span>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
      title: "Sucherposition",
    }).addTo(map);
  }

  saveState();
  updateStats();
}

async function loadPins() {
  const categoryIds = getRequestedPoiCategoryIds();
  const queryBounds = getPoiQueryBounds();
  const queryArea = boundsToAreaKm2(queryBounds);
  const maxArea = ui.poiCategory.value === "all" ? MAX_ALL_QUERY_AREA_KM2 : MAX_SINGLE_QUERY_AREA_KM2;

  if (queryArea > maxArea) {
    setStatus(`Weiter reinzoomen: ${Math.round(queryArea).toLocaleString("de-DE")} km2`, "Pins");
    return;
  }

  ui.loadPinsBtn.disabled = true;
  setStatus("Pins werden geladen", "Pins");

  try {
    const backendResult = await tryLoadPinsFromBackend(categoryIds, queryBounds);
    const incomingPois = backendResult?.items ??
      await loadPinsFromOverpass(categoryIds, queryBounds);
    const addedCount = mergePois(incomingPois);

    pinsVisible = true;
    renderPoiMarkers();
    saveState();

    if (backendResult?.cacheHit) {
      setStatus(`${incomingPois.length} Pins aus Cache`, "Pins");
    } else if (addedCount === 0) {
      setStatus("Keine neuen Pins gefunden", "Pins");
    } else {
      setStatus(`${addedCount} Pins geladen`, "Pins");
    }
  } catch {
    setStatus("Pins konnten nicht geladen werden", "Pins");
  } finally {
    ui.loadPinsBtn.disabled = false;
    updateControls();
  }
}

async function tryLoadPinsFromBackend(categoryIds, bounds) {
  try {
    const data = await postBackendJson("/api/map/pins", {
      bounds: serializeBounds(bounds),
      categories: categoryIds,
      use_cache: true,
      refresh: false,
    });

    return {
      cacheHit: Boolean(data.cache_hit),
      items: data.items
        .map(normalizeBackendPoi)
        .filter(Boolean)
        .filter(isPoiInsideBoundary),
    };
  } catch {
    return null;
  }
}

async function loadPinsFromOverpass(categoryIds, bounds) {
  const query = buildOverpassQuery(categoryIds, bounds);
  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass returned ${response.status}`);
  }

  const data = await response.json();
  return data.elements
    .map((element) => normalizeOverpassElement(element, categoryIds))
    .filter(Boolean)
    .filter(isPoiInsideBoundary);
}

function getRequestedPoiCategoryIds() {
  if (ui.poiCategory.value !== "all") {
    return [ui.poiCategory.value];
  }

  return POI_CATEGORY_ORDER.filter((categoryId) => POI_CATEGORIES[categoryId].includeInAll);
}

function getPoiQueryBounds() {
  if (boundaryLayer) {
    return boundaryLayer.getBounds();
  }

  return map.getBounds();
}

function buildOverpassQuery(categoryIds, bounds) {
  const bbox = [
    bounds.getSouth(),
    bounds.getWest(),
    bounds.getNorth(),
    bounds.getEast(),
  ].map((value) => value.toFixed(6)).join(",");
  const fragments = [];

  categoryIds.forEach((categoryId) => {
    POI_CATEGORIES[categoryId].filters.forEach((filter) => {
      fragments.push(`node${filter}(${bbox});`);
      fragments.push(`way${filter}(${bbox});`);
      fragments.push(`relation${filter}(${bbox});`);
    });
  });

  return `[out:json][timeout:25];
(
  ${fragments.join("\n  ")}
);
out center tags;`;
}

function normalizeOverpassElement(element, requestedCategoryIds) {
  const latlng = getElementLatLng(element);

  if (!latlng || !element.tags) {
    return null;
  }

  const categoryId = inferPoiCategory(element.tags, requestedCategoryIds);

  if (!categoryId) {
    return null;
  }

  const category = POI_CATEGORIES[categoryId];

  return {
    id: `${categoryId}/${element.type}/${element.id}`,
    category: categoryId,
    name: getPoiName(element.tags, category),
    lat: latlng.lat,
    lng: latlng.lng,
    osmId: `${element.type}/${element.id}`,
    source: "osm",
  };
}

function getElementLatLng(element) {
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) {
    return {
      lat: element.lat,
      lng: element.lon,
    };
  }

  if (element.center && Number.isFinite(element.center.lat) && Number.isFinite(element.center.lon)) {
    return {
      lat: element.center.lat,
      lng: element.center.lon,
    };
  }

  return null;
}

function inferPoiCategory(tags, requestedCategoryIds) {
  return requestedCategoryIds.find((categoryId) => matchesPoiCategory(categoryId, tags)) ?? null;
}

function matchesPoiCategory(categoryId, tags) {
  switch (categoryId) {
    case "airport":
      return tags.aeroway === "aerodrome" && Boolean(tags.iata || /international|regional|public/i.test(tags["aerodrome:type"] ?? ""));
    case "rail_station":
      return tags.railway === "station" || (tags.public_transport === "station" && tags.train === "yes");
    case "transit_stop":
      return tags.highway === "bus_stop" ||
        tags.railway === "halt" ||
        tags.railway === "tram_stop" ||
        tags.public_transport === "platform";
    case "peak":
      return tags.natural === "peak";
    case "park":
      return tags.leisure === "park" || tags.boundary === "protected_area";
    case "amusement_park":
      return tags.tourism === "theme_park";
    case "zoo":
      return tags.tourism === "zoo";
    case "aquarium":
      return tags.tourism === "aquarium";
    case "golf_course":
      return tags.leisure === "golf_course";
    case "museum":
      return tags.tourism === "museum";
    case "cinema":
      return tags.amenity === "cinema";
    case "hospital":
      return tags.amenity === "hospital";
    case "library":
      return tags.amenity === "library";
    case "consulate":
      return (tags.office === "diplomatic" || tags.amenity === "embassy") &&
        /consulate|consulate_general|honorary_consulate/i.test(tags.diplomatic ?? "");
    case "water":
      return tags.natural === "water" || tags.landuse === "reservoir" || tags.waterway === "riverbank";
    default:
      return false;
  }
}

function getPoiName(tags, category) {
  return tags.name || tags["name:de"] || tags["name:en"] || category.label;
}

function mergePois(incomingPois) {
  const nextPois = new Map(pois.map((poi) => [poi.id, poi]));
  let addedCount = 0;

  incomingPois.forEach((poi) => {
    if (!nextPois.has(poi.id)) {
      addedCount += 1;
    }

    nextPois.set(poi.id, poi);
  });

  pois = Array.from(nextPois.values());
  return addedCount;
}

function renderPoiMarkers() {
  if (!poiLayer) {
    return;
  }

  poiLayer.clearLayers();

  const visiblePois = getVisiblePois();

  if (!pinsVisible) {
    updateStats(visiblePois.length);
    updatePinLegend(visiblePois);
    updateControls();
    return;
  }

  const poisToRender = visiblePois.slice(0, MAX_POIS_ON_MAP);

  poisToRender.forEach((poi) => {
    createPoiMarker(poi).addTo(poiLayer);
  });

  if (visiblePois.length > MAX_POIS_ON_MAP) {
    setStatus(`${MAX_POIS_ON_MAP} von ${visiblePois.length} Pins angezeigt`, "Pins");
  }

  updateStats(visiblePois.length);
  updatePinLegend(visiblePois);
  updateControls();
}

function getVisiblePois() {
  const selectedCategory = ui.poiCategory.value;

  return pois.filter((poi) => {
    const categoryMatches = selectedCategory === "all" || poi.category === selectedCategory;
    return categoryMatches && isPoiInsideBoundary(poi);
  });
}

function createPoiMarker(poi) {
  const category = POI_CATEGORIES[poi.category];
  const marker = L.circleMarker([poi.lat, poi.lng], {
    renderer: poiRenderer,
    radius: getPoiMarkerRadius(),
    color: "#ffffff",
    fillColor: category.color,
    fillOpacity: 0.9,
    opacity: 0.95,
    weight: 1.5,
    bubblingMouseEvents: false,
    title: poi.name,
  });

  marker.bindPopup(`
    <div class="poi-popup">
      <strong>${escapeHtml(poi.name)}</strong>
      <span>${escapeHtml(category.label)}</span>
      <span>${poi.source === "manual" ? "Manuell" : escapeHtml(poi.osmId)}</span>
      <span>${poi.lat.toFixed(5)}, ${poi.lng.toFixed(5)}</span>
    </div>
  `);

  return marker;
}

function getPoiMarkerRadius() {
  if (!map) {
    return 6;
  }

  if (map.getZoom() >= 15) {
    return 7;
  }

  if (map.getZoom() <= 10) {
    return 4;
  }

  return 5.5;
}

function toggleManualPinPlacement() {
  setManualPinPlacement(!isSettingPoi);
}

function setManualPinPlacement(active) {
  isSettingPoi = active;

  if (active) {
    isDrawingBoundary = false;
    setSeekerPlacement(false);
    clearDraft();
    setStatus("Pinposition setzen", "Pins");
  } else if (!isDrawingBoundary && !isSettingSeeker) {
    setStatus("Bereit", "OSM");
  }

  updateControls();
}

function addManualPoi(latlng) {
  const categoryId = ui.poiCategory.value;

  if (categoryId === "all") {
    setStatus("Erst Pin-Typ waehlen", "Pins");
    return;
  }

  const poi = {
    id: `manual/${categoryId}/${Date.now()}`,
    category: categoryId,
    name: `Manueller ${POI_CATEGORIES[categoryId].label}`,
    lat: latlng.lat,
    lng: latlng.lng,
    source: "manual",
  };

  if (!isPoiInsideBoundary(poi)) {
    setStatus("Pin liegt ausserhalb der Grenze", "Pins");
    return;
  }

  pois.push(poi);
  pinsVisible = true;
  renderPoiMarkers();
  saveState();
  setStatus("Pin gesetzt", "Pins");
}

function togglePins() {
  pinsVisible = !pinsVisible;
  renderPoiMarkers();
  saveState();
}

function clearPins() {
  pois = [];
  pinsVisible = true;
  renderPoiMarkers();
  saveState();
  setStatus("Pins geloescht", "Pins");
}

function updatePinLegend(poiList = getVisiblePois()) {
  const counts = getPoiCountsByCategory(poiList);
  const categoryIds = Object.keys(counts);

  ui.poiCategoryCount.textContent = categoryIds.length === 1 ? "1 Kategorie" : `${categoryIds.length} Kategorien`;
  ui.pinLegend.innerHTML = categoryIds.map((categoryId) => {
    const category = POI_CATEGORIES[categoryId];
    return `<span class="pin-chip" style="--chip-color: ${category.color}">${escapeHtml(category.label)} ${counts[categoryId]}</span>`;
  }).join("");
}

function getPoiCountsByCategory(poiList) {
  return poiList.reduce((counts, poi) => {
    counts[poi.category] = (counts[poi.category] ?? 0) + 1;
    return counts;
  }, {});
}

function isPoiInsideBoundary(poi) {
  if (!boundaryLayer || boundaryPoints.length < 3) {
    return true;
  }

  return pointInPolygon(L.latLng(poi.lat, poi.lng), boundaryPoints);
}

function pointInPolygon(point, polygon) {
  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    const intersects = yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function boundsToAreaKm2(bounds) {
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const west = bounds.getWest();
  const east = bounds.getEast();
  const centerLat = degreesToRadians((south + north) / 2);
  const heightKm = Math.abs(north - south) * 110.574;
  const widthKm = Math.abs(east - west) * 111.32 * Math.cos(centerLat);

  return Math.max(0, heightKm * widthKm);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function focusRmvArea() {
  map.fitBounds(FRANKFURT_RMV_BOUNDS, { padding: [32, 32] });
  setStatus("Frankfurt/RMV im Fokus", "OePNV");
}

async function postBackendJson(path, payload) {
  const response = await fetch(`${BACKEND_API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`);
  }

  return response.json();
}

function serializeBounds(bounds) {
  return {
    south: bounds.getSouth(),
    west: bounds.getWest(),
    north: bounds.getNorth(),
    east: bounds.getEast(),
  };
}

function normalizeBackendPoi(item) {
  const lat = Number(item.lat);
  const lng = Number(item.lng);

  if (!POI_CATEGORIES[item.category] || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    id: String(item.id),
    category: item.category,
    name: String(item.name),
    lat,
    lng,
    osmId: item.osm_id ? String(item.osm_id) : undefined,
    source: item.source === "manual" ? "manual" : "osm",
  };
}

function normalizeBackendTransitLine(line) {
  const ref = normalizeTransitRef(line.ref || line.id);
  const mode = String(line.mode || "train");
  const lineId = String(line.id || `${mode}:${ref}`);

  if (!ref || !Array.isArray(line.paths)) {
    return null;
  }

  const paths = line.paths
    .map(normalizeCoordinateList)
    .filter((path) => path.length >= 2);

  if (paths.length === 0) {
    return null;
  }

  return {
    id: lineId,
    ref,
    mode,
    modeLabel: String(line.mode_label || TRANSIT_MODE_LABELS[mode] || mode),
    name: String(line.name || ref),
    network: line.network ? String(line.network) : "",
    operator: line.operator ? String(line.operator) : "",
    routes: Array.isArray(line.routes) ? line.routes.map(String) : [],
    paths,
    stations: normalizeTransitStations(line.stations),
  };
}

async function loadTransitLines() {
  const lineIds = getRequestedTransitTypeIds();
  const queryBounds = getTransitQueryBounds();
  const queryArea = boundsToAreaKm2(queryBounds);

  if (queryArea > MAX_TRANSIT_QUERY_AREA_KM2) {
    setStatus(`Weiter reinzoomen: ${Math.round(queryArea).toLocaleString("de-DE")} km2`, "OePNV");
    return;
  }

  ui.loadTransitBtn.disabled = true;
  setStatus("Linien werden geladen", "OePNV");

  try {
    const backendResult = await tryLoadTransitFromBackend(lineIds, queryBounds);
    const incomingLines = backendResult?.lines ??
      await loadTransitFromOverpass(lineIds, queryBounds);
    const addedCount = mergeTransitLines(incomingLines);

    transitVisible = true;
    renderTransitLines();

    if (backendResult?.cacheHit) {
      setStatus(`${incomingLines.length} Linien aus Cache`, "OePNV");
    } else if (addedCount === 0) {
      setStatus("Keine neuen Linien gefunden", "OePNV");
    } else {
      setStatus(`${addedCount} Linien geladen`, "OePNV");
    }
  } catch {
    setStatus("Linien konnten nicht geladen werden", "OePNV");
  } finally {
    ui.loadTransitBtn.disabled = false;
    updateControls();
  }
}

async function tryLoadTransitFromBackend(lineIds, bounds) {
  try {
    const data = await postBackendJson("/api/map/transit-lines", {
      bounds: serializeBounds(bounds),
      categories: lineIds,
      use_cache: true,
      refresh: false,
    });

    return {
      cacheHit: Boolean(data.cache_hit),
      lines: data.lines
        .map(normalizeBackendTransitLine)
        .filter(Boolean)
        .filter(isTransitLineInsideBoundary),
    };
  } catch {
    return null;
  }
}

async function loadTransitFromOverpass(lineIds, bounds) {
  const query = buildTransitLineQuery(lineIds, bounds);
  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass returned ${response.status}`);
  }

  const data = await response.json();
  return normalizeTransitLinesFromOverpass(data, lineIds)
    .filter(isTransitLineInsideBoundary);
}

function getRequestedTransitTypeIds() {
  if (ui.transitType.value !== "all") {
    return [ui.transitType.value];
  }

  return ["all"];
}

function getTransitQueryBounds() {
  if (boundaryLayer) {
    return boundaryLayer.getBounds();
  }

  return map.getBounds();
}

function buildTransitLineQuery(lineIds, bounds) {
  const bbox = [
    bounds.getSouth(),
    bounds.getWest(),
    bounds.getNorth(),
    bounds.getEast(),
  ].map((value) => value.toFixed(6)).join(",");
  const routeRegex = Object.keys(TRANSIT_MODE_LABELS).join("|");

  if (lineIds.includes("all")) {
    return `[out:json][timeout:40];
(
  relation["type"="route"]["route"~"^(${routeRegex})$"](${bbox});
)->.routes;
.routes out body;
way(r.routes)(${bbox})->.routeWays;
node(r.routes)(${bbox})->.routeNodes;
relation(r.routes)(${bbox})->.routeRelations;
.routeWays out body geom;
.routeNodes out body;
.routeRelations out body center;`;
  }

  const fragments = lineIds.map((lineId) => {
    const { mode, ref } = parseTransitLineId(lineId);
    const refFilter = ref ? `["ref"~"^${buildTransitRefRegex(ref)}$",i]` : "";

    if (mode) {
      return `relation["type"="route"]["route"="${mode}"]${refFilter}(${bbox});`;
    }

    return `relation["type"="route"]["route"~"^(${routeRegex})$"]${refFilter}(${bbox});`;
  });

  return `[out:json][timeout:40];
(
  ${fragments.join("\n  ")}
)->.routes;
.routes out body;
way(r.routes)(${bbox})->.routeWays;
node(r.routes)(${bbox})->.routeNodes;
relation(r.routes)(${bbox})->.routeRelations;
.routeWays out body geom;
.routeNodes out body;
.routeRelations out body center;`;
}

function normalizeTransitLinesFromOverpass(data, requestedLineIds) {
  const elements = data.elements ?? [];
  const elementIndex = new Map(elements.map((element) => [`${element.type}/${element.id}`, element]));
  const linesByRef = new Map();
  const requestAllLines = requestedLineIds.includes("all");

  elements
    .filter((element) => element.type === "relation")
    .forEach((relation) => {
      const tags = relation.tags ?? {};
      const mode = String(tags.route ?? "");

      if (!TRANSIT_MODE_LABELS[mode]) {
        return;
      }

      const ref = normalizeTransitRef(tags.ref);
      const fallbackRef = normalizeTransitRef(tags.name || `relation/${relation.id}`);
      const resolvedRef = ref || fallbackRef;
      const lineId = `${mode}:${resolvedRef}`;

      if (!requestAllLines && !requestedLineIds.includes(lineId) && !requestedLineIds.includes(resolvedRef)) {
        return;
      }

      const line = linesByRef.get(lineId) ?? {
        id: lineId,
        ref: resolvedRef,
        mode,
        modeLabel: TRANSIT_MODE_LABELS[mode],
        name: tags.name || resolvedRef,
        network: tags.network || "",
        operator: tags.operator || "",
        routes: [],
        paths: [],
        pathIds: new Set(),
        stations: [],
        stationIds: new Set(),
      };

      line.routes.push(`relation/${relation.id}`);

      (relation.members ?? []).forEach((member) => {
        const memberElement = elementIndex.get(`${member.type}/${member.ref}`);
        const role = String(member.role ?? "");

        if (member.type === "way" && !isTransitStationRole(role)) {
          const path = normalizeGeometry(memberElement ?? member);
          const pathId = getTransitMemberIdentity(member, path);

          if (path.length >= 2 && !line.pathIds.has(pathId)) {
            line.pathIds.add(pathId);
            line.paths.push(path);
          }
        }

        if (isTransitStationRole(role)) {
          const station = normalizeTransitStation(member, memberElement);
          const stationKey = station ? getTransitStationIdentity(station) : null;

          if (station && !line.stationIds.has(stationKey)) {
            line.stationIds.add(stationKey);
            line.stations.push(station);
          }
        }
      });

      linesByRef.set(lineId, line);
    });

  return Array.from(linesByRef.values())
    .sort(compareTransitLines)
    .map((line) => {
      delete line.pathIds;
      delete line.stationIds;
      return line;
    });
}

function mergeTransitLines(incomingLines) {
  const nextLines = new Map(transitLines.map((line) => [line.id, line]));
  let addedCount = 0;

  incomingLines.forEach((line) => {
    if (!nextLines.has(line.id)) {
      addedCount += 1;
    }

    nextLines.set(line.id, line);
  });

  transitLines = Array.from(nextLines.values())
    .sort(compareTransitLines);
  updateTransitLineOptions();
  return addedCount;
}

function renderTransitLines() {
  if (!transitLayer || !transitStationLayer) {
    return;
  }

  transitLayer.clearLayers();
  transitStationLayer.clearLayers();

  const visibleLines = getVisibleTransitLines();
  const selectedLine = ui.transitType.value;
  const visibleStations = getStationsForLines(visibleLines);

  if (!transitVisible) {
    updateStats(undefined, visibleLines.length, 0);
    updateTransitLegend(visibleLines);
    updateControls();
    return;
  }

  const linesToRender = visibleLines.slice(0, MAX_TRANSIT_LINES_ON_MAP);

  linesToRender.forEach((line) => {
    createTransitLine(line).addTo(transitLayer);
  });

  visibleStations.forEach((station) => {
    createTransitStationMarker(station, selectedLine).addTo(transitStationLayer);
  });

  if (visibleLines.length > MAX_TRANSIT_LINES_ON_MAP) {
    setStatus(`${MAX_TRANSIT_LINES_ON_MAP} von ${visibleLines.length} Linien angezeigt`, "OePNV");
  }

  updateStats(undefined, visibleLines.length, visibleStations.length);
  updateTransitLegend(visibleLines);
  updateControls();
}

function getVisibleTransitLines() {
  const selectedType = ui.transitType.value;

  return transitLines.filter((line) => {
    const typeMatches = selectedType === "all" || line.id === selectedType || line.ref === selectedType;
    return typeMatches && isTransitLineInsideBoundary(line);
  });
}

function createTransitLine(line) {
  const lineStyle = getTransitLineStyle(line);
  const pathLayer = L.polyline(line.paths, {
    renderer: transitRenderer,
    color: lineStyle.color,
    opacity: ui.transitType.value === "all" ? 0.78 : 0.95,
    weight: getTransitLineWeight(lineStyle),
    smoothFactor: 1.4,
    bubblingMouseEvents: false,
  });

  pathLayer.bindPopup(`
    <div class="poi-popup">
      <strong>${escapeHtml(line.ref)}</strong>
      <span>${escapeHtml(line.name)}</span>
      <span>${escapeHtml(line.modeLabel)}</span>
      ${line.network ? `<span>${escapeHtml(line.network)}</span>` : ""}
      ${line.operator ? `<span>${escapeHtml(line.operator)}</span>` : ""}
      <span>${line.stations.length} Stationen</span>
    </div>
  `);

  return pathLayer;
}

function getTransitLineWeight(transitType) {
  if (!map) {
    return transitType.weight;
  }

  if (map.getZoom() >= 14) {
    return transitType.weight + 1;
  }

  if (map.getZoom() <= 10) {
    return Math.max(1.5, transitType.weight - 1);
  }

  return transitType.weight;
}

function toggleTransitLines() {
  transitVisible = !transitVisible;
  renderTransitLines();
}

function clearTransitLines() {
  transitLines = [];
  transitVisible = true;
  updateTransitLineOptions();
  renderTransitLines();
  setStatus("Linien geloescht", "OePNV");
}

function updateTransitLegend(lineList = getVisibleTransitLines()) {
  const lineIds = lineList.map((line) => line.id);

  ui.transitTypeCount.textContent = lineIds.length === 1 ? "1 Linie" : `${lineIds.length} Linien`;
  ui.transitLegend.innerHTML = lineList.map((line) => {
    const lineStyle = getTransitLineStyle(line);
    return `<span class="line-chip" style="--chip-color: ${lineStyle.color}">${escapeHtml(line.ref)} ${line.stations.length}</span>`;
  }).join("");
}

function updateTransitLineOptions() {
  const selectedValue = ui.transitType.value;
  const options = ['<option value="all">Alle Linien</option>']
    .concat(transitLines.map((line) =>
      `<option value="${escapeHtml(line.id)}">${escapeHtml(line.ref)} - ${escapeHtml(line.modeLabel)}</option>`));

  ui.transitType.innerHTML = options.join("");

  if (selectedValue !== "all" && transitLines.some((line) => line.id === selectedValue)) {
    ui.transitType.value = selectedValue;
  } else {
    ui.transitType.value = "all";
  }
}

function getTransitLineStyle(line) {
  return {
    color: line.color || getTransitLineColor(line.id),
    weight: getTransitBaseWeight(line.mode),
  };
}

function getTransitLineColor(lineId) {
  let hash = 0;

  for (let index = 0; index < lineId.length; index += 1) {
    hash = ((hash << 5) - hash) + lineId.charCodeAt(index);
    hash |= 0;
  }

  return TRANSIT_LINE_PALETTE[Math.abs(hash) % TRANSIT_LINE_PALETTE.length];
}

function getTransitBaseWeight(mode) {
  if (mode === "tram") {
    return 2.5;
  }

  return 4;
}

function compareTransitLines(lineA, lineB) {
  const modeOrder = {
    train: 0,
    light_rail: 1,
    subway: 2,
    tram: 3,
  };
  const modeDelta = (modeOrder[lineA.mode] ?? 99) - (modeOrder[lineB.mode] ?? 99);

  if (modeDelta !== 0) {
    return modeDelta;
  }

  return naturalTransitRef(lineA.ref).localeCompare(naturalTransitRef(lineB.ref), "de");
}

function naturalTransitRef(ref) {
  return String(ref).replace(/\d+/g, (value) => value.padStart(4, "0"));
}

function parseTransitLineId(lineId) {
  if (!String(lineId).includes(":")) {
    return {
      mode: "",
      ref: normalizeTransitRef(lineId),
    };
  }

  const [mode, ref] = String(lineId).split(":", 2);
  return {
    mode,
    ref: normalizeTransitRef(ref),
  };
}

function buildTransitRefRegex(ref) {
  const normalizedRef = normalizeTransitRef(ref);
  const match = normalizedRef.match(/^([A-Z]+)([0-9].*)$/);

  if (match) {
    return `${escapeRegex(match[1])} ?${escapeRegex(match[2])}`;
  }

  return escapeRegex(ref).replace(/\\ /g, " ?");
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTransitRef(value) {
  return String(value ?? "").toUpperCase().replace(/\s+/g, "");
}

function normalizeCoordinateList(coordinates) {
  if (!Array.isArray(coordinates)) {
    return [];
  }

  return coordinates
    .map(([lat, lng]) => [Number(lat), Number(lng)])
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
}

function normalizeGeometry(element) {
  if (!element || !Array.isArray(element.geometry)) {
    return [];
  }

  return element.geometry
    .map((point) => [Number(point.lat), Number(point.lon)])
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
}

function isTransitStationRole(role) {
  const normalizedRole = String(role ?? "").toLowerCase();
  return normalizedRole.includes("stop") ||
    normalizedRole.includes("platform") ||
    normalizedRole.includes("station");
}

function normalizeTransitStations(stations) {
  if (!Array.isArray(stations)) {
    return [];
  }

  const stationMap = new Map();

  stations.forEach((station) => {
    const normalizedStation = normalizeTransitStation(station);

    if (normalizedStation) {
      stationMap.set(getTransitStationIdentity(normalizedStation), normalizedStation);
    }
  });

  return Array.from(stationMap.values());
}

function normalizeTransitStation(memberOrStation, memberElement) {
  const source = memberElement ?? memberOrStation;
  const role = String(memberOrStation.role ?? "");
  const latLng = getStationLatLng(source);

  if (!latLng) {
    return null;
  }

  const tags = source.tags ?? {};
  const osmType = memberOrStation.type ?? source.type ?? "station";
  const osmId = memberOrStation.ref ?? source.id ?? `${latLng.lat},${latLng.lng}`;

  return {
    id: String(memberOrStation.id ?? `${osmType}/${osmId}`),
    name: String(memberOrStation.name ?? tags.name ?? tags["name:de"] ?? tags["name:en"] ?? "Station"),
    lat: latLng.lat,
    lng: latLng.lng,
    role,
    osmId: String(memberOrStation.osm_id ?? `${osmType}/${osmId}`),
  };
}

function getStationLatLng(source) {
  const lat = Number(source.lat);
  const lng = Number(source.lng ?? source.lon);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }

  const geometry = normalizeGeometry(source);

  if (geometry.length === 0) {
    return null;
  }

  return {
    lat: geometry.reduce((sum, point) => sum + point[0], 0) / geometry.length,
    lng: geometry.reduce((sum, point) => sum + point[1], 0) / geometry.length,
  };
}

function getStationsForLines(lines) {
  const stationsById = new Map();

  lines.forEach((line) => {
    line.stations.forEach((station) => {
      if (isStationInsideBoundary(station)) {
        const stationKey = getTransitStationIdentity(station);
        const existingStation = stationsById.get(stationKey);

        if (existingStation) {
          existingStation.lineRefs = Array.from(new Set(existingStation.lineRefs.concat(line.ref))).sort();
        } else {
          stationsById.set(stationKey, {
            ...station,
            lineRefs: [line.ref],
            lineId: line.id,
          });
        }
      }
    });
  });

  return Array.from(stationsById.values());
}

function getTransitStationIdentity(station) {
  const normalizedName = String(station.name ?? "").trim().toLowerCase();

  if (normalizedName && normalizedName !== "station") {
    return normalizedName;
  }

  return station.id;
}

function getTransitMemberIdentity(member, geometry) {
  if (member.type && member.ref !== undefined && member.ref !== null) {
    return `${member.type}/${member.ref}`;
  }

  return JSON.stringify(geometry);
}

function createTransitStationMarker(station, lineRef) {
  const line = transitLines.find((candidate) => candidate.id === station.lineId);
  const markerColor = line ? getTransitLineStyle(line).color : "#172026";
  const marker = L.circleMarker([station.lat, station.lng], {
    renderer: transitRenderer,
    radius: getTransitStationRadius(),
    color: "#ffffff",
    fillColor: markerColor,
    fillOpacity: 0.95,
    opacity: 1,
    weight: 2,
    bubblingMouseEvents: false,
    title: station.name,
  });

  marker.bindPopup(`
    <div class="poi-popup">
      <strong>${escapeHtml(station.name)}</strong>
      <span>${escapeHtml(station.lineRefs?.join(", ") || lineRef)}</span>
      ${station.role ? `<span>${escapeHtml(station.role)}</span>` : ""}
      <span>${escapeHtml(station.osmId)}</span>
    </div>
  `);

  return marker;
}

function getTransitStationRadius() {
  if (!map) {
    return 5;
  }

  if (map.getZoom() >= 14) {
    return 6;
  }

  return 4.5;
}

function isTransitLineInsideBoundary(line) {
  if (!boundaryLayer || boundaryPoints.length < 3) {
    return true;
  }

  const hasPointInside = line.paths.some((path) =>
    path.some(([lat, lng]) => pointInPolygon(L.latLng(lat, lng), boundaryPoints)));

  if (hasPointInside) {
    return true;
  }

  return line.paths.some((path) => boundaryLayer.getBounds().intersects(L.latLngBounds(path)));
}

function isStationInsideBoundary(station) {
  if (!boundaryLayer || boundaryPoints.length < 3) {
    return true;
  }

  return pointInPolygon(L.latLng(station.lat, station.lng), boundaryPoints);
}

function previewRadar() {
  const seekerLatLng = seekerMarker?.getLatLng();

  if (!seekerLatLng) {
    setStatus("Sucherposition fehlt", "Radar");
    setSeekerPlacement(true);
    return;
  }

  const radius = Number(ui.radarDistance.value);
  clearRadar();

  radarLayer = L.circle(seekerLatLng, {
    radius,
    color: "#ea580c",
    fillColor: "#ea580c",
    fillOpacity: 0.14,
    opacity: 0.95,
    weight: 2,
  }).addTo(map);

  map.fitBounds(radarLayer.getBounds(), {
    padding: [48, 48],
    maxZoom: 15,
  });

  ui.clearRadarBtn.disabled = false;
  setStatus(`Radar ${formatDistance(radius)}`, "Radar");
}

function clearRadar() {
  if (radarLayer) {
    map.removeLayer(radarLayer);
    radarLayer = null;
  }

  ui.clearRadarBtn.disabled = true;
}

function fitGameView() {
  if (boundaryLayer) {
    map.fitBounds(boundaryLayer.getBounds(), { padding: [48, 48] });
    return;
  }

  if (seekerMarker) {
    map.setView(seekerMarker.getLatLng(), Math.max(map.getZoom(), 15));
    return;
  }

  map.setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom);
}

function clearGame() {
  clearBoundary();
  clearDraft();
  clearRadar();
  transitLines = [];
  transitVisible = true;
  renderTransitLines();
  pois = [];
  pinsVisible = true;
  renderPoiMarkers();
  boundaryPoints = [];
  isDrawingBoundary = false;
  setSeekerPlacement(false);

  if (seekerMarker) {
    map.removeLayer(seekerMarker);
    seekerMarker = null;
  }

  if (accuracyLayer) {
    map.removeLayer(accuracyLayer);
    accuracyLayer = null;
  }

  localStorage.removeItem(STORAGE_KEY);
  setStatus("Karte zurueckgesetzt", "OSM");
  updateControls();
  updateStats();
}

function updateControls() {
  ui.drawBoundaryBtn.classList.toggle("is-active", isDrawingBoundary);
  ui.setSeekerBtn.classList.toggle("is-active", isSettingSeeker);
  ui.setManualPinBtn.classList.toggle("is-active", isSettingPoi);
  ui.finishBoundaryBtn.disabled = !isDrawingBoundary || boundaryPoints.length < 3;
  ui.cancelBoundaryBtn.disabled = !isDrawingBoundary;
  ui.togglePinsBtn.disabled = pois.length === 0;
  ui.clearPinsBtn.disabled = pois.length === 0;
  ui.toggleTransitBtn.disabled = transitLines.length === 0;
  ui.clearTransitBtn.disabled = transitLines.length === 0;
  ui.togglePinsBtn.innerHTML = pinsVisible ?
    '<i data-lucide="eye-off"></i><span>Ausblenden</span>' :
    '<i data-lucide="eye"></i><span>Anzeigen</span>';
  ui.toggleTransitBtn.innerHTML = transitVisible ?
    '<i data-lucide="eye-off"></i><span>Ausblenden</span>' :
    '<i data-lucide="eye"></i><span>Anzeigen</span>';

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function updateStats(visiblePoiCount, visibleTransitCount, visibleStationCount) {
  const resolvedPoiCount = Number.isFinite(visiblePoiCount) ? visiblePoiCount : getVisiblePois().length;
  const visibleLines = getVisibleTransitLines();
  const resolvedTransitCount = Number.isFinite(visibleTransitCount) ? visibleTransitCount : visibleLines.length;
  const resolvedStationCount = Number.isFinite(visibleStationCount) ?
    visibleStationCount :
    (ui.transitType.value === "all" ? 0 : getStationsForLines(visibleLines).length);

  ui.zoomValue.textContent = map ? String(map.getZoom()) : "-";
  ui.pointCountValue.textContent = String(boundaryPoints.length);
  ui.poiCountValue.textContent = String(resolvedPoiCount);
  ui.transitCountValue.textContent = String(resolvedTransitCount);
  ui.stationCountValue.textContent = String(resolvedStationCount);

  if (boundaryLayer && boundaryPoints.length >= 3) {
    ui.areaValue.textContent = formatArea(Math.abs(geodesicArea(boundaryPoints)));
  } else {
    ui.areaValue.textContent = "-";
  }

  if (seekerMarker) {
    const { lat, lng } = seekerMarker.getLatLng();
    ui.seekerValue.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } else {
    ui.seekerValue.textContent = "-";
  }
}

function setStatus(message, badgeText) {
  ui.statusText.textContent = message;
  ui.modeText.textContent = message;

  if (badgeText) {
    ui.mapStatus.textContent = badgeText;
  }
}

function persistView() {
  saveState();
}

function saveState() {
  if (!map) {
    return;
  }

  const state = {
    view: {
      center: [map.getCenter().lat, map.getCenter().lng],
      zoom: map.getZoom(),
    },
    boundary: boundaryLayer ? boundaryPoints.map(serializeLatLng) : [],
    seeker: seekerMarker ? serializeLatLng(seekerMarker.getLatLng()) : null,
    pinsVisible,
    pois: pois.map(serializePoi),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    setStatus("Speichern nicht moeglich", "OSM");
  }
}

function loadState() {
  try {
    const rawState = localStorage.getItem(STORAGE_KEY);
    return rawState ? JSON.parse(rawState) : {};
  } catch {
    return {};
  }
}

function restoreSavedLayers(state) {
  if (Array.isArray(state.boundary) && state.boundary.length >= 3) {
    setBoundary(state.boundary);
  }

  if (state.seeker) {
    placeSeeker(state.seeker);
  }

  if (Array.isArray(state.pois)) {
    pois = state.pois
      .filter((poi) => POI_CATEGORIES[poi.category])
      .map((poi) => ({
        id: String(poi.id),
        category: poi.category,
        name: String(poi.name),
        lat: Number(poi.lat),
        lng: Number(poi.lng),
        osmId: poi.osmId ? String(poi.osmId) : undefined,
        source: poi.source === "manual" ? "manual" : "osm",
      }))
      .filter((poi) => Number.isFinite(poi.lat) && Number.isFinite(poi.lng));
  }

  pinsVisible = state.pinsVisible !== false;
  renderPoiMarkers();
}

function serializeLatLng(latlng) {
  return {
    lat: Number(latlng.lat),
    lng: Number(latlng.lng),
  };
}

function serializePoi(poi) {
  return {
    id: poi.id,
    category: poi.category,
    name: poi.name,
    lat: Number(poi.lat),
    lng: Number(poi.lng),
    osmId: poi.osmId,
    source: poi.source,
  };
}

function geodesicArea(latlngs) {
  const earthRadius = 6378137;
  let area = 0;

  for (let i = 0; i < latlngs.length; i += 1) {
    const point1 = latlngs[i];
    const point2 = latlngs[(i + 1) % latlngs.length];
    area += degreesToRadians(point2.lng - point1.lng) *
      (2 + Math.sin(degreesToRadians(point1.lat)) + Math.sin(degreesToRadians(point2.lat)));
  }

  return (area * earthRadius * earthRadius) / 2;
}

function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

function formatArea(squareMeters) {
  if (!Number.isFinite(squareMeters) || squareMeters <= 0) {
    return "-";
  }

  if (squareMeters < 10000) {
    return `${Math.round(squareMeters).toLocaleString("de-DE")} m2`;
  }

  if (squareMeters < 1000000) {
    return `${(squareMeters / 10000).toLocaleString("de-DE", {
      maximumFractionDigits: 1,
    })} ha`;
  }

  return `${(squareMeters / 1000000).toLocaleString("de-DE", {
    maximumFractionDigits: 2,
  })} km2`;
}

function formatDistance(meters) {
  if (meters < 1000) {
    return `${meters} m`;
  }

  return `${(meters / 1000).toLocaleString("de-DE", {
    maximumFractionDigits: 1,
  })} km`;
}

function showMapFallback() {
  const fallback = document.createElement("div");
  fallback.className = "map-fallback";
  fallback.innerHTML = `
    <div>
      <strong>Karte nicht verfuegbar</strong>
      <span>Leaflet konnte nicht geladen werden.</span>
    </div>
  `;
  document.body.appendChild(fallback);
}
