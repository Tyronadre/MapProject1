const STORAGE_KEY = "irl-hide-seek-map-state-v1";
const DEFAULT_GAME_NAME = "Hide and Seek Game";
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
const MAX_SEARCH_CELLS = 2400;
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
const QUESTION_TYPES = {
  matching: {
    label: "Matching",
    answerOptions: [
      ["yes", "Ja"],
      ["no", "Nein"],
    ],
  },
  measuring: {
    label: "Measuring",
    answerOptions: [
      ["closer", "Closer"],
      ["further", "Further"],
    ],
  },
  radar: {
    label: "Radar",
    answerOptions: [
      ["yes", "Ja"],
      ["no", "Nein"],
    ],
  },
  thermometer: {
    label: "Thermometer",
    answerOptions: [
      ["closer", "Closer"],
      ["further", "Further"],
    ],
  },
};
const MATCHING_QUESTION_CATEGORIES = [
  ["airport", "Commercial airport"],
  ["transit_line", "Transit line"],
  ["station_name_length", "Station name length"],
  ["street_name", "Name of street or path"],
  ["admin_1", "1st administrative division"],
  ["admin_2", "2nd administrative division"],
  ["admin_3", "3rd administrative division"],
  ["admin_4", "4th administrative division"],
  ["peak", "Mountain"],
  ["park", "Park"],
  ["amusement_park", "Amusement park"],
  ["zoo", "Zoo"],
  ["aquarium", "Aquarium"],
  ["golf_course", "Golf course"],
  ["museum", "Museum"],
  ["cinema", "Movie theatre"],
  ["hospital", "Hospital"],
  ["library", "Library"],
  ["consulate", "Foreign consulate"],
];
const MEASURING_QUESTION_CATEGORIES = [
  ["airport", "Commercial airport"],
  ["high_speed_train_line", "High speed train line"],
  ["rail_station", "Rail stations"],
  ["international_border", "International border"],
  ["admin_1_border", "1st administrative division border"],
  ["admin_2_border", "2nd administrative division border"],
  ["sea_level", "Sea level"],
  ["water", "Body of water"],
  ["coastline", "Coastline"],
  ["peak", "Mountain"],
  ["park", "Park"],
  ["amusement_park", "Amusement park"],
  ["zoo", "Zoo"],
  ["aquarium", "Aquarium"],
  ["golf_course", "Golf course"],
  ["museum", "Museum"],
  ["cinema", "Movie theatre"],
  ["hospital", "Hospital"],
  ["library", "Library"],
  ["consulate", "Foreign consulate"],
];
const RADAR_DISTANCES = [
  [400, "400 m"],
  [800, "800 m"],
  [1600, "1.6 km"],
  [4800, "4.8 km"],
  [8000, "8 km"],
  [16000, "16 km"],
  [40000, "40 km"],
  [80000, "80 km"],
  [160000, "160 km"],
  ["custom", "Eigene Distanz"],
];
const THERMOMETER_DISTANCES = [
  [800, "800 m"],
  [4800, "4.8 km"],
  [16000, "16 km"],
];

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
  answerCountValue: document.querySelector("#answerCountValue"),
  remainingCellCountValue: document.querySelector("#remainingCellCountValue"),
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
  questionSyncValue: document.querySelector("#questionSyncValue"),
  questionType: document.querySelector("#questionType"),
  questionCategoryRow: document.querySelector("#questionCategoryRow"),
  questionCategory: document.querySelector("#questionCategory"),
  questionDistanceRow: document.querySelector("#questionDistanceRow"),
  questionDistance: document.querySelector("#questionDistance"),
  questionCustomDistanceRow: document.querySelector("#questionCustomDistanceRow"),
  questionCustomDistance: document.querySelector("#questionCustomDistance"),
  questionAnswer: document.querySelector("#questionAnswer"),
  thermometerFields: document.querySelector("#thermometerFields"),
  setThermometerStartBtn: document.querySelector("#setThermometerStartBtn"),
  setThermometerEndBtn: document.querySelector("#setThermometerEndBtn"),
  thermometerStartValue: document.querySelector("#thermometerStartValue"),
  thermometerEndValue: document.querySelector("#thermometerEndValue"),
  saveQuestionBtn: document.querySelector("#saveQuestionBtn"),
  cancelQuestionEditBtn: document.querySelector("#cancelQuestionEditBtn"),
  questionStatus: document.querySelector("#questionStatus"),
  answerList: document.querySelector("#answerList"),
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
let searchRenderer = null;
let searchGridLayer = null;
let questionGeometryLayer = null;
let searchCells = [];
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
let isSettingThermometerEnd = false;
let thermometerStart = null;
let thermometerEnd = null;
let gameId = null;
let answers = [];
let answerEffects = new Map();
let editingAnswerId = null;
let gameSyncAvailable = false;

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

  searchRenderer = L.canvas({ padding: 0.5 });
  searchGridLayer = L.layerGroup().addTo(map);
  questionGeometryLayer = L.layerGroup().addTo(map);
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
  populateQuestionCatalog();
  restoreSavedLayers(savedState);
  updateQuestionForm();
  updateThermometerValues();
  initGameSession();
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
  ui.questionType.addEventListener("change", updateQuestionForm);
  ui.questionDistance.addEventListener("change", updateQuestionForm);
  ui.questionCategory.addEventListener("change", updateQuestionStatus);
  ui.questionAnswer.addEventListener("change", updateQuestionStatus);
  ui.setThermometerStartBtn.addEventListener("click", setThermometerStartFromSeeker);
  ui.setThermometerEndBtn.addEventListener("click", toggleThermometerEndPlacement);
  ui.saveQuestionBtn.addEventListener("click", saveQuestionAnswer);
  ui.cancelQuestionEditBtn.addEventListener("click", cancelQuestionEdit);
  ui.answerList.addEventListener("click", handleAnswerListClick);
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

  if (isSettingThermometerEnd) {
    setThermometerEnd(event.latlng);
    setThermometerEndPlacement(false);
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
  rebuildSearchGrid();
  applyAnswersToSearchGrid();
  syncGameBounds();
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
  searchCells = [];
  if (questionGeometryLayer) {
    questionGeometryLayer.clearLayers();
  }
  renderSearchGrid();
  renderPoiMarkers();
  renderTransitLines();
  updateStats();
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
    setThermometerEndPlacement(false);
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
  updateQuestionStatus();
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
    applyAnswersToSearchGrid();
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
    setThermometerEndPlacement(false);
    clearDraft();
    setStatus("Pinposition setzen", "Pins");
  } else if (!isDrawingBoundary && !isSettingSeeker && !isSettingThermometerEnd) {
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
  return requestBackendJson(path, {
    method: "POST",
    payload,
  });
}

async function putBackendJson(path, payload) {
  return requestBackendJson(path, {
    method: "PUT",
    payload,
  });
}

async function getBackendJson(path) {
  return requestBackendJson(path, {
    method: "GET",
  });
}

async function deleteBackend(path) {
  await requestBackendJson(path, {
    method: "DELETE",
    expectJson: false,
  });
}

async function requestBackendJson(path, options = {}) {
  const method = options.method ?? "GET";
  const headers = {};

  if (options.payload !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BACKEND_API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.payload === undefined ? undefined : JSON.stringify(options.payload),
  });

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`);
  }

  if (options.expectJson === false || response.status === 204) {
    return null;
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

async function initGameSession() {
  gameId = savedState.gameId || null;
  setQuestionSync("Server ...");

  try {
    if (gameId) {
      try {
        const game = await getBackendJson(`/api/games/${gameId}`);
        if (!boundaryLayer && Array.isArray(game.bounds) && game.bounds.length >= 3) {
          setBoundary(game.bounds);
        }
      } catch {
        gameId = null;
      }
    }

    if (!gameId) {
      const game = await postBackendJson("/api/games", {
        name: DEFAULT_GAME_NAME,
        bounds: boundaryLayer ? boundaryPoints.map(serializeLatLng) : null,
      });
      gameId = game.id;
      saveState();
    }

    gameSyncAvailable = true;
    setQuestionSync("Server ok");
    await syncGameBounds();
    await loadAnswersFromServer();
  } catch {
    gameSyncAvailable = false;
    setQuestionSync("Server offline");
    renderAnswerList();
    updateQuestionStatus();
  }
}

async function syncGameBounds() {
  if (!gameId || !gameSyncAvailable || !boundaryLayer || boundaryPoints.length < 3) {
    return;
  }

  try {
    await postBackendJson(`/api/games/${gameId}/bounds`, {
      bounds: boundaryPoints.map(serializeLatLng),
    });
  } catch {
    gameSyncAvailable = false;
    setQuestionSync("Server offline");
  }
}

async function loadAnswersFromServer() {
  if (!gameId) {
    return;
  }

  const data = await getBackendJson(`/api/games/${gameId}/answers`);
  answers = data.map(normalizeAnswerRecord).filter(Boolean);
  applyAnswersToSearchGrid();
  renderAnswerList();
  updateQuestionStatus();
}

function normalizeAnswerRecord(record) {
  if (!record || !QUESTION_TYPES[record.question_type]) {
    return null;
  }

  return {
    id: String(record.id),
    gameId: String(record.game_id),
    questionType: String(record.question_type),
    category: record.category ? String(record.category) : "",
    questionText: record.question_text ? String(record.question_text) : "",
    answer: String(record.answer),
    seekerPosition: record.seeker_position ? normalizeLatLngObject(record.seeker_position) : null,
    payload: record.payload && typeof record.payload === "object" ? record.payload : {},
    createdAt: String(record.created_at),
  };
}

function normalizeLatLngObject(value) {
  const lat = Number(value.lat);
  const lng = Number(value.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

function populateQuestionCatalog() {
  ui.questionType.innerHTML = Object.entries(QUESTION_TYPES)
    .map(([type, config]) => `<option value="${type}">${escapeHtml(config.label)}</option>`)
    .join("");
}

function updateQuestionForm() {
  const type = ui.questionType.value || "matching";
  updateQuestionCategoryOptions(type);
  updateQuestionAnswerOptions(type);
  updateQuestionDistanceOptions(type);

  const hasCategory = type === "matching" || type === "measuring";
  const hasDistance = type === "radar" || type === "thermometer";
  const hasThermometerFields = type === "thermometer";

  ui.questionCategoryRow.classList.toggle("is-hidden", !hasCategory);
  ui.questionDistanceRow.classList.toggle("is-hidden", !hasDistance);
  ui.thermometerFields.classList.toggle("is-hidden", !hasThermometerFields);
  ui.questionCustomDistanceRow.classList.toggle(
    "is-hidden",
    !(type === "radar" && ui.questionDistance.value === "custom"),
  );

  updateQuestionStatus();
  updateControls();
}

function updateQuestionCategoryOptions(type) {
  const categories = type === "measuring" ? MEASURING_QUESTION_CATEGORIES : MATCHING_QUESTION_CATEGORIES;
  const selected = ui.questionCategory.value;

  ui.questionCategory.innerHTML = categories
    .map(([categoryId, label]) => `<option value="${categoryId}">${escapeHtml(label)}</option>`)
    .join("");

  if (categories.some(([categoryId]) => categoryId === selected)) {
    ui.questionCategory.value = selected;
  }
}

function updateQuestionAnswerOptions(type) {
  const selected = ui.questionAnswer.value;
  const options = QUESTION_TYPES[type]?.answerOptions ?? QUESTION_TYPES.matching.answerOptions;

  ui.questionAnswer.innerHTML = options
    .map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`)
    .join("");

  if (options.some(([value]) => value === selected)) {
    ui.questionAnswer.value = selected;
  }
}

function updateQuestionDistanceOptions(type) {
  const selected = ui.questionDistance.value;
  const distances = type === "thermometer" ? THERMOMETER_DISTANCES : RADAR_DISTANCES;

  ui.questionDistance.innerHTML = distances
    .map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`)
    .join("");

  if (distances.some(([value]) => String(value) === selected)) {
    ui.questionDistance.value = selected;
  } else if (type === "radar") {
    ui.questionDistance.value = "4800";
  }
}

function updateQuestionStatus(message) {
  if (message) {
    ui.questionStatus.textContent = message;
    return;
  }

  const type = ui.questionType.value || "matching";
  const category = ui.questionCategory.value;

  if (!boundaryLayer) {
    ui.questionStatus.textContent = "Spielgrenze fehlt";
    return;
  }

  if ((type === "radar" || type === "matching" || type === "measuring") && !seekerMarker) {
    ui.questionStatus.textContent = "Sucherposition fehlt";
    return;
  }

  if (type === "matching" || type === "measuring") {
    const features = getQuestionFeatures(category);
    ui.questionStatus.textContent = features.length > 0 ?
      `${features.length} Referenzen verfuegbar` :
      "Keine passenden Referenzen geladen";
    return;
  }

  if (type === "thermometer" && (!thermometerStart || !thermometerEnd)) {
    ui.questionStatus.textContent = "Thermometerpunkte fehlen";
    return;
  }

  ui.questionStatus.textContent = `${getRemainingCellCount()} Zellen verbleibend`;
}

function setQuestionSync(value) {
  ui.questionSyncValue.textContent = value;
}

function setThermometerStartFromSeeker() {
  const seekerLatLng = seekerMarker?.getLatLng();

  if (!seekerLatLng) {
    setStatus("Sucherposition fehlt", "Thermometer");
    setSeekerPlacement(true);
    return;
  }

  thermometerStart = serializeLatLng(seekerLatLng);
  updateThermometerValues();
  updateQuestionStatus();
}

function toggleThermometerEndPlacement() {
  setThermometerEndPlacement(!isSettingThermometerEnd);
}

function setThermometerEndPlacement(active) {
  isSettingThermometerEnd = active;

  if (active) {
    isDrawingBoundary = false;
    setSeekerPlacement(false);
    setManualPinPlacement(false);
    clearDraft();
    setStatus("Thermometer-Ende setzen", "Thermo");
  } else if (!isDrawingBoundary && !isSettingSeeker && !isSettingPoi) {
    setStatus("Bereit", "OSM");
  }

  updateControls();
}

function setThermometerEnd(latlng) {
  thermometerEnd = serializeLatLng(latlng);
  updateThermometerValues();
  updateQuestionStatus();
}

function updateThermometerValues() {
  ui.thermometerStartValue.textContent = thermometerStart ?
    `${thermometerStart.lat.toFixed(5)}, ${thermometerStart.lng.toFixed(5)}` :
    "-";
  ui.thermometerEndValue.textContent = thermometerEnd ?
    `${thermometerEnd.lat.toFixed(5)}, ${thermometerEnd.lng.toFixed(5)}` :
    "-";
}

async function saveQuestionAnswer() {
  if (!boundaryLayer) {
    updateQuestionStatus("Spielgrenze fehlt");
    return;
  }

  try {
    await ensureWritableGameSession();
    const payload = buildQuestionAnswerPayload();
    const saved = editingAnswerId ?
      await putBackendJson(`/api/games/${gameId}/answers/${editingAnswerId}`, payload) :
      await postBackendJson(`/api/games/${gameId}/answers`, payload);
    const normalized = normalizeAnswerRecord(saved);

    if (!normalized) {
      throw new Error("Invalid answer response");
    }

    if (editingAnswerId) {
      answers = answers.map((answer) => answer.id === normalized.id ? normalized : answer);
    } else {
      answers.push(normalized);
    }

    editingAnswerId = null;
    ui.saveQuestionBtn.innerHTML = '<i data-lucide="list-plus"></i><span>Antwort speichern</span>';
    ui.cancelQuestionEditBtn.disabled = true;
    setQuestionSync("Server ok");
    gameSyncAvailable = true;
    applyAnswersToSearchGrid();
    renderAnswerList();
    updateQuestionStatus("Antwort gespeichert");
    updateControls();
  } catch (error) {
    updateQuestionStatus(error.message || "Antwort konnte nicht gespeichert werden");
  }
}

async function ensureWritableGameSession() {
  if (gameId && gameSyncAvailable) {
    return;
  }

  await initGameSession();

  if (!gameId || !gameSyncAvailable) {
    throw new Error("Server nicht erreichbar");
  }
}

function buildQuestionAnswerPayload() {
  const type = ui.questionType.value || "matching";
  const answer = ui.questionAnswer.value;
  const category = type === "matching" || type === "measuring" ? ui.questionCategory.value : "";
  const seekerLatLng = seekerMarker?.getLatLng();
  const seekerPosition = seekerLatLng ? serializeLatLng(seekerLatLng) : null;
  const payload = {
    category_label: getQuestionCategoryLabel(type, category),
  };

  if ((type === "radar" || type === "matching" || type === "measuring") && !seekerPosition) {
    throw new Error("Sucherposition fehlt");
  }

  if (type === "radar") {
    payload.radius_m = getSelectedQuestionDistanceMeters();
    payload.distance_label = formatDistance(payload.radius_m);
  }

  if (type === "thermometer") {
    if (!thermometerStart || !thermometerEnd) {
      throw new Error("Thermometerpunkte fehlen");
    }

    payload.travel_distance_m = getSelectedQuestionDistanceMeters();
    payload.distance_label = formatDistance(payload.travel_distance_m);
    payload.start_position = thermometerStart;
    payload.end_position = thermometerEnd;
  }

  return {
    question_type: type,
    category: category || null,
    question_text: buildQuestionText(type, category, payload),
    answer,
    seeker_position: seekerPosition,
    payload,
  };
}

function getSelectedQuestionDistanceMeters() {
  if (ui.questionDistance.value === "custom") {
    const customDistance = Number(ui.questionCustomDistance.value);

    if (!Number.isFinite(customDistance) || customDistance <= 0) {
      throw new Error("Distanz fehlt");
    }

    return Math.round(customDistance);
  }

  const distance = Number(ui.questionDistance.value);

  if (!Number.isFinite(distance) || distance <= 0) {
    throw new Error("Distanz fehlt");
  }

  return distance;
}

function buildQuestionText(type, category, payload) {
  const categoryLabel = getQuestionCategoryLabel(type, category);

  if (type === "matching") {
    return `Is your nearest ${categoryLabel} the same as my ${categoryLabel}?`;
  }

  if (type === "measuring") {
    return `Compared to me, are you closer or further from ${categoryLabel}?`;
  }

  if (type === "radar") {
    return `Are you within ${payload.distance_label} of me?`;
  }

  return `After traveling for ${payload.distance_label}, am I closer or further away from you?`;
}

function getQuestionCategoryLabel(type, category) {
  const categories = type === "measuring" ? MEASURING_QUESTION_CATEGORIES : MATCHING_QUESTION_CATEGORIES;
  return categories.find(([categoryId]) => categoryId === category)?.[1] ?? "";
}

function renderAnswerList() {
  if (answers.length === 0) {
    ui.answerList.innerHTML = "";
    updateStats();
    return;
  }

  ui.answerList.innerHTML = answers.map((answer, index) => {
    const effect = answerEffects.get(answer.id);
    const effectLabel = effect ? formatAnswerEffect(effect) : "Nicht berechnet";
    const editingClass = answer.id === editingAnswerId ? " is-editing" : "";

    return `
      <div class="answer-item${editingClass}" data-answer-id="${escapeHtml(answer.id)}">
        <div class="answer-main">
          <strong>${index + 1}. ${escapeHtml(answer.questionText || QUESTION_TYPES[answer.questionType].label)}</strong>
          <span>${escapeHtml(formatAnswerValue(answer.answer))} - ${escapeHtml(effectLabel)}</span>
        </div>
        <div class="answer-actions">
          <button class="tool-button" type="button" data-answer-action="edit">
            <i data-lucide="pencil"></i>
            <span>Aendern</span>
          </button>
          <button class="tool-button danger" type="button" data-answer-action="delete">
            <i data-lucide="trash-2"></i>
            <span>Loeschen</span>
          </button>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) {
    window.lucide.createIcons();
  }

  updateStats();
}

function formatAnswerValue(value) {
  const labels = {
    yes: "Ja",
    no: "Nein",
    closer: "Closer",
    further: "Further",
  };
  return labels[value] ?? value;
}

function formatAnswerEffect(effect) {
  if (effect.status === "applied") {
    return `${effect.excludedCount} ausgeschlossen`;
  }

  return effect.reason || "Nicht angewendet";
}

async function handleAnswerListClick(event) {
  const button = event.target.closest("[data-answer-action]");

  if (!button) {
    return;
  }

  const item = button.closest("[data-answer-id]");
  const answerId = item?.dataset.answerId;
  const action = button.dataset.answerAction;

  if (!answerId) {
    return;
  }

  if (action === "edit") {
    editAnswer(answerId);
    return;
  }

  if (action === "delete") {
    await deleteAnswer(answerId);
  }
}

function editAnswer(answerId) {
  const answer = answers.find((candidate) => candidate.id === answerId);

  if (!answer) {
    return;
  }

  editingAnswerId = answerId;
  ui.questionType.value = answer.questionType;
  updateQuestionForm();

  if (answer.category) {
    ui.questionCategory.value = answer.category;
  }

  if (answer.questionType === "radar") {
    setQuestionDistanceValue(answer.payload.radius_m);
  }

  if (answer.questionType === "thermometer") {
    setQuestionDistanceValue(answer.payload.travel_distance_m);
    thermometerStart = normalizeLatLngObject(answer.payload.start_position);
    thermometerEnd = normalizeLatLngObject(answer.payload.end_position);
    updateThermometerValues();
  }

  ui.questionAnswer.value = answer.answer;
  ui.saveQuestionBtn.innerHTML = '<i data-lucide="save"></i><span>Aenderung speichern</span>';
  ui.cancelQuestionEditBtn.disabled = false;
  renderAnswerList();
  updateQuestionStatus("Antwort wird bearbeitet");
  updateControls();
}

function setQuestionDistanceValue(distanceMeters) {
  const distanceValue = String(distanceMeters);
  const hasOption = Array.from(ui.questionDistance.options)
    .some((option) => option.value === distanceValue);

  if (hasOption) {
    ui.questionDistance.value = distanceValue;
    ui.questionCustomDistanceRow.classList.add("is-hidden");
  } else {
    ui.questionDistance.value = "custom";
    ui.questionCustomDistance.value = distanceMeters || "";
    ui.questionCustomDistanceRow.classList.remove("is-hidden");
  }
}

function cancelQuestionEdit() {
  editingAnswerId = null;
  ui.saveQuestionBtn.innerHTML = '<i data-lucide="list-plus"></i><span>Antwort speichern</span>';
  ui.cancelQuestionEditBtn.disabled = true;
  renderAnswerList();
  updateQuestionStatus();
  updateControls();
}

async function deleteAnswer(answerId) {
  try {
    await ensureWritableGameSession();
    await deleteBackend(`/api/games/${gameId}/answers/${answerId}`);
    answers = answers.filter((answer) => answer.id !== answerId);

    if (editingAnswerId === answerId) {
      cancelQuestionEdit();
    }

    applyAnswersToSearchGrid();
    renderAnswerList();
    updateQuestionStatus("Antwort geloescht");
  } catch {
    updateQuestionStatus("Antwort konnte nicht geloescht werden");
  }
}

function rebuildSearchGrid() {
  if (!boundaryLayer || boundaryPoints.length < 3) {
    searchCells = [];
    renderSearchGrid();
    return;
  }

  const bounds = boundaryLayer.getBounds();
  const areaKm2 = Math.abs(geodesicArea(boundaryPoints)) / 1000000;
  let cellSizeMeters = getSearchCellSizeMeters(areaKm2);
  let cells = [];

  do {
    cells = generateSearchCells(bounds, cellSizeMeters);
    if (cells.length > MAX_SEARCH_CELLS) {
      cellSizeMeters *= 1.35;
    }
  } while (cells.length > MAX_SEARCH_CELLS && cellSizeMeters < 2500);

  searchCells = cells;
  renderSearchGrid();
}

function getSearchCellSizeMeters(areaKm2) {
  if (areaKm2 > 1200) {
    return 800;
  }

  if (areaKm2 > 400) {
    return 500;
  }

  if (areaKm2 > 80) {
    return 250;
  }

  if (areaKm2 > 20) {
    return 150;
  }

  return 100;
}

function generateSearchCells(bounds, cellSizeMeters) {
  const centerLat = (bounds.getSouth() + bounds.getNorth()) / 2;
  const latStep = metersToLatDegrees(cellSizeMeters);
  const lngStep = metersToLngDegrees(cellSizeMeters, centerLat);
  const cells = [];
  let index = 0;

  for (let south = bounds.getSouth(); south < bounds.getNorth(); south += latStep) {
    const north = Math.min(south + latStep, bounds.getNorth());

    for (let west = bounds.getWest(); west < bounds.getEast(); west += lngStep) {
      const east = Math.min(west + lngStep, bounds.getEast());
      const center = L.latLng((south + north) / 2, (west + east) / 2);

      if (!pointInPolygon(center, boundaryPoints)) {
        continue;
      }

      cells.push({
        id: `cell-${index}`,
        center,
        bounds: [[south, west], [north, east]],
        areaSquareMeters: cellAreaSquareMeters(south, north, west, east),
        status: "possible",
        excludedBy: null,
      });
      index += 1;
    }
  }

  return cells;
}

function applyAnswersToSearchGrid() {
  if (searchCells.length === 0) {
    answerEffects = new Map();
    renderSearchGrid();
    renderAnswerList();
    return;
  }

  searchCells.forEach((cell) => {
    cell.status = "possible";
    cell.excludedBy = null;
  });
  answerEffects = new Map();

  answers.forEach((answer) => {
    const context = buildQuestionContext(answer);

    if (!context.applicable) {
      answerEffects.set(answer.id, {
        status: "skipped",
        reason: context.reason,
        excludedCount: 0,
      });
      return;
    }

    let evaluatedCount = 0;
    let excludedCount = 0;

    searchCells.forEach((cell) => {
      if (cell.status === "excluded") {
        return;
      }

      const keep = cellMatchesAnswer(cell, answer, context);

      if (keep === null) {
        return;
      }

      evaluatedCount += 1;

      if (!keep) {
        cell.status = "excluded";
        cell.excludedBy = answer.id;
        excludedCount += 1;
      }
    });

    answerEffects.set(answer.id, {
      status: evaluatedCount > 0 ? "applied" : "skipped",
      reason: evaluatedCount > 0 ? "" : "Keine Zellen ausgewertet",
      excludedCount,
    });
  });

  renderQuestionGeometry();
  renderSearchGrid();
  renderAnswerList();
  updateQuestionStatus();
}

function buildQuestionContext(answer) {
  if (answer.questionType === "radar") {
    const radius = Number(answer.payload.radius_m);

    if (!answer.seekerPosition || !Number.isFinite(radius)) {
      return { applicable: false, reason: "Radar-Daten fehlen" };
    }

    return { applicable: true, radius };
  }

  if (answer.questionType === "thermometer") {
    const start = normalizeLatLngObject(answer.payload.start_position);
    const end = normalizeLatLngObject(answer.payload.end_position);

    if (!start || !end) {
      return { applicable: false, reason: "Thermometerpunkte fehlen" };
    }

    return { applicable: true, start, end };
  }

  if (answer.questionType === "matching") {
    const features = getQuestionFeatures(answer.category);

    if (!answer.seekerPosition || features.length === 0) {
      return { applicable: false, reason: "Referenzen fehlen" };
    }

    const seekerValue = getMatchingValueForPoint(answer.seekerPosition, answer.category, features);

    if (!seekerValue) {
      return { applicable: false, reason: "Sucher-Referenz fehlt" };
    }

    return {
      applicable: true,
      features,
      seekerValue,
    };
  }

  if (answer.questionType === "measuring") {
    const features = getQuestionFeatures(answer.category);

    if (!answer.seekerPosition || features.length === 0) {
      return { applicable: false, reason: "Referenzen fehlen" };
    }

    const seekerDistance = distanceToNearestFeature(answer.seekerPosition, features);

    if (!Number.isFinite(seekerDistance)) {
      return { applicable: false, reason: "Sucher-Distanz fehlt" };
    }

    return {
      applicable: true,
      features,
      seekerDistance,
    };
  }

  return { applicable: false, reason: "Fragetyp unbekannt" };
}

function cellMatchesAnswer(cell, answer, context) {
  if (answer.questionType === "radar") {
    const distance = distanceMeters(cell.center, answer.seekerPosition);
    const inside = distance <= context.radius;
    return answer.answer === "yes" ? inside : !inside;
  }

  if (answer.questionType === "thermometer") {
    const startDistance = distanceMeters(cell.center, context.start);
    const endDistance = distanceMeters(cell.center, context.end);
    const closerAfterTravel = endDistance < startDistance;
    return answer.answer === "closer" ? closerAfterTravel : !closerAfterTravel;
  }

  if (answer.questionType === "matching") {
    const cellValue = getMatchingValueForPoint(cell.center, answer.category, context.features);

    if (!cellValue) {
      return null;
    }

    const matches = matchingValuesOverlap(context.seekerValue, cellValue);
    return answer.answer === "yes" ? matches : !matches;
  }

  if (answer.questionType === "measuring") {
    const cellDistance = distanceToNearestFeature(cell.center, context.features);

    if (!Number.isFinite(cellDistance)) {
      return null;
    }

    return answer.answer === "closer" ?
      cellDistance < context.seekerDistance :
      cellDistance > context.seekerDistance;
  }

  return null;
}

function renderSearchGrid() {
  if (!searchGridLayer) {
    return;
  }

  searchGridLayer.clearLayers();

  searchCells.forEach((cell) => {
    const possible = cell.status !== "excluded";
    L.rectangle(cell.bounds, {
      renderer: searchRenderer,
      interactive: false,
      stroke: false,
      fillColor: possible ? "#138a63" : "#b42318",
      fillOpacity: possible ? 0.18 : 0.22,
    }).addTo(searchGridLayer);
  });

  updateStats();
}

function renderQuestionGeometry() {
  if (!questionGeometryLayer) {
    return;
  }

  questionGeometryLayer.clearLayers();

  answers.forEach((answer) => {
    if (answer.questionType === "radar" && answer.seekerPosition && Number.isFinite(Number(answer.payload.radius_m))) {
      L.circle(answer.seekerPosition, {
        radius: Number(answer.payload.radius_m),
        color: answer.answer === "yes" ? "#138a63" : "#b42318",
        fill: false,
        opacity: 0.75,
        weight: 2,
        interactive: false,
      }).addTo(questionGeometryLayer);
    }

    if (answer.questionType === "thermometer") {
      const start = normalizeLatLngObject(answer.payload.start_position);
      const end = normalizeLatLngObject(answer.payload.end_position);

      if (start && end) {
        L.polyline([start, end], {
          color: answer.answer === "closer" ? "#138a63" : "#b42318",
          opacity: 0.85,
          weight: 3,
          dashArray: "8 7",
          interactive: false,
        }).addTo(questionGeometryLayer);
      }
    }
  });
}

function getQuestionFeatures(category) {
  if (!category) {
    return [];
  }

  if (category === "transit_line" || category === "station_name_length" || category === "rail_station") {
    const stationFeatures = getStationQuestionFeatures();

    if (category === "rail_station") {
      return stationFeatures.concat(getPoiQuestionFeatures("rail_station"));
    }

    return stationFeatures;
  }

  if (category === "high_speed_train_line") {
    return getHighSpeedTrainLineFeatures();
  }

  if (POI_CATEGORIES[category]) {
    return getPoiQuestionFeatures(category);
  }

  return [];
}

function getPoiQuestionFeatures(category) {
  return pois
    .filter((poi) => poi.category === category && isPoiInsideBoundary(poi))
    .map((poi) => ({
      id: poi.id,
      name: poi.name,
      lat: poi.lat,
      lng: poi.lng,
      kind: "poi",
    }));
}

function getStationQuestionFeatures() {
  return getStationsForLines(transitLines)
    .map((station) => ({
      id: station.id,
      name: station.name,
      lat: station.lat,
      lng: station.lng,
      lineRefs: station.lineRefs || [],
      kind: "station",
    }));
}

function getHighSpeedTrainLineFeatures() {
  const highSpeedPattern = /^(ICE|IC|EC|FLX|TGV|RJ)/i;
  const features = [];

  transitLines
    .filter((line) => line.mode === "train" && highSpeedPattern.test(line.ref))
    .forEach((line) => {
      line.paths.forEach((path, pathIndex) => {
        path.forEach(([lat, lng], pointIndex) => {
          features.push({
            id: `${line.id}/${pathIndex}/${pointIndex}`,
            name: line.ref,
            lat,
            lng,
            kind: "line-point",
          });
        });
      });
    });

  return features;
}

function getMatchingValueForPoint(point, category, features) {
  const nearest = nearestFeature(point, features);

  if (!nearest) {
    return null;
  }

  if (category === "transit_line") {
    return {
      type: "set",
      values: nearest.lineRefs?.length ? nearest.lineRefs : [nearest.name],
    };
  }

  if (category === "station_name_length") {
    return {
      type: "value",
      value: String(normalizedNameLength(nearest.name)),
    };
  }

  return {
    type: "value",
    value: nearest.id,
  };
}

function matchingValuesOverlap(left, right) {
  if (left.type === "set" || right.type === "set") {
    const leftValues = new Set(left.type === "set" ? left.values : [left.value]);
    const rightValues = right.type === "set" ? right.values : [right.value];
    return rightValues.some((value) => leftValues.has(value));
  }

  return left.value === right.value;
}

function distanceToNearestFeature(point, features) {
  const nearest = nearestFeature(point, features);
  return nearest ? nearest.distance : Number.NaN;
}

function nearestFeature(point, features) {
  let nearest = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  features.forEach((feature) => {
    const distance = distanceMeters(point, feature);

    if (distance < nearestDistance) {
      nearest = feature;
      nearestDistance = distance;
    }
  });

  return nearest ? { ...nearest, distance: nearestDistance } : null;
}

function normalizedNameLength(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\s\-'".,()]/g, "")
    .length;
}

function getRemainingCellCount() {
  return searchCells.filter((cell) => cell.status !== "excluded").length;
}

function getRemainingSearchAreaSquareMeters() {
  return searchCells
    .filter((cell) => cell.status !== "excluded")
    .reduce((sum, cell) => sum + cell.areaSquareMeters, 0);
}

function metersToLatDegrees(meters) {
  return meters / 110574;
}

function metersToLngDegrees(meters, latitude) {
  return meters / (111320 * Math.max(0.2, Math.cos(degreesToRadians(latitude))));
}

function cellAreaSquareMeters(south, north, west, east) {
  const centerLat = (south + north) / 2;
  const height = Math.abs(north - south) * 110574;
  const width = Math.abs(east - west) * 111320 * Math.cos(degreesToRadians(centerLat));
  return Math.max(0, height * width);
}

function distanceMeters(pointA, pointB) {
  const lat1 = degreesToRadians(Number(pointA.lat));
  const lat2 = degreesToRadians(Number(pointB.lat));
  const deltaLat = degreesToRadians(Number(pointB.lat) - Number(pointA.lat));
  const deltaLng = degreesToRadians(Number(pointB.lng) - Number(pointA.lng));
  const haversine = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 6371000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
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
    applyAnswersToSearchGrid();

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
  if (questionGeometryLayer) {
    questionGeometryLayer.clearLayers();
  }
  transitLines = [];
  transitVisible = true;
  renderTransitLines();
  pois = [];
  pinsVisible = true;
  renderPoiMarkers();
  answers = [];
  answerEffects = new Map();
  gameId = null;
  gameSyncAvailable = false;
  editingAnswerId = null;
  boundaryPoints = [];
  searchCells = [];
  renderSearchGrid();
  isDrawingBoundary = false;
  setThermometerEndPlacement(false);
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
  renderAnswerList();
  initGameSession();
  setStatus("Karte zurueckgesetzt", "OSM");
  updateControls();
  updateStats();
}

function updateControls() {
  ui.drawBoundaryBtn.classList.toggle("is-active", isDrawingBoundary);
  ui.setSeekerBtn.classList.toggle("is-active", isSettingSeeker);
  ui.setManualPinBtn.classList.toggle("is-active", isSettingPoi);
  ui.setThermometerEndBtn.classList.toggle("is-active", isSettingThermometerEnd);
  ui.finishBoundaryBtn.disabled = !isDrawingBoundary || boundaryPoints.length < 3;
  ui.cancelBoundaryBtn.disabled = !isDrawingBoundary;
  ui.togglePinsBtn.disabled = pois.length === 0;
  ui.clearPinsBtn.disabled = pois.length === 0;
  ui.toggleTransitBtn.disabled = transitLines.length === 0;
  ui.clearTransitBtn.disabled = transitLines.length === 0;
  ui.saveQuestionBtn.disabled = !boundaryLayer;
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
  const remainingCells = getRemainingCellCount();

  ui.zoomValue.textContent = map ? String(map.getZoom()) : "-";
  ui.pointCountValue.textContent = String(boundaryPoints.length);
  ui.poiCountValue.textContent = String(resolvedPoiCount);
  ui.transitCountValue.textContent = String(resolvedTransitCount);
  ui.stationCountValue.textContent = String(resolvedStationCount);
  ui.answerCountValue.textContent = String(answers.length);
  ui.remainingCellCountValue.textContent = searchCells.length > 0 ? String(remainingCells) : "0";

  if (searchCells.length > 0) {
    ui.areaValue.textContent = formatArea(getRemainingSearchAreaSquareMeters());
  } else if (boundaryLayer && boundaryPoints.length >= 3) {
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
    gameId,
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
