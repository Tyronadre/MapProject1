# Frontend-Prototyp

Dies ist der erste lauffaehige Karten-Prototyp fuer das IRL-Hide-and-Seek-Spiel.

## Starten

Die Datei kann direkt im Browser geoeffnet werden:

```text
frontend/index.html
```

Optional mit lokalem Server:

```powershell
cd frontend
python -m http.server 5173 --bind 127.0.0.1
```

Dann im Browser oeffnen:

```text
http://127.0.0.1:5173
```

## Aktueller Funktionsumfang

- echte OpenStreetMap-Karte ueber Leaflet
- mobile Bedienoberflaeche
- GPS-Ortung oder manuelles Setzen der Sucherposition
- Spielgrenze per Polygon zeichnen
- Anzeige der geschaetzten Suchflaeche
- Frage-relevante Pins aus OpenStreetMap/Overpass laden
- Pins nach Kategorie filtern, ausblenden und loeschen
- manuelle Pins fuer fehlende oder bewusst gesetzte Locations
- performantes Canvas-Rendering fuer groessere Pin-Mengen
- rail-bound OePNV-Linien fuer den aktuellen Kartenausschnitt laden
- Stationen der geladenen OePNV-Linien als Nodes anzeigen
- Frankfurt/RMV-Fokus fuer den Spielraum rund um Frankfurt
- Radarkreis als erster Karten-Layer
- lokales Speichern des Spielstands im Browser

Die Karte nutzt derzeit OpenStreetMap-Tiles, Overpass API und CDN-Dateien fuer Leaflet/Lucide. Fuer Offline- oder Produktionsbetrieb sollte spaeter ein eigener Tile-Provider, ein eigener Overpass-Import oder ein Backend-Import ueber PostGIS eingetragen werden.

Wenn das Backend unter `http://127.0.0.1:8000` laeuft, werden Pins und OePNV-Linien zuerst ueber den Backend-Cache geladen. Falls das Backend nicht erreichbar ist, nutzt das Frontend automatisch die direkte Overpass-Abfrage wie bisher.

Eine andere Backend-URL kann im Browser gesetzt werden:

```js
localStorage.setItem("mapgame_backend_url", "http://127.0.0.1:8000");
```

## Pin-Kategorien

Der Prototyp unterstuetzt aktuell:

- commercial airport
- rail station
- transit stop
- mountain
- park
- amusement park
- zoo
- aquarium
- golf course
- museum
- movie theatre
- hospital
- library
- foreign consulate
- body of water

Wenn eine Spielgrenze gesetzt ist, werden Pins ausserhalb der Grenze beim Laden und Anzeigen ignoriert.

## OePNV-Linien

Der OePNV-Layer laedt aktuell rail-bound Route-Relationen aus OpenStreetMap:

- `route=train`
- `route=light_rail`
- `route=subway`
- `route=tram`

Die Linien werden fuer den sichtbaren Kartenausschnitt oder die gezeichnete Spielgrenze geladen und mit Canvas gerendert. Varianten derselben Linie werden zusammengefasst, sodass im Frontend eine Linie als ein Multi-Polyline-Layer gezeichnet wird. Stationen der geladenen Linien werden immer als Nodes angezeigt. Fahrplanzeiten und echte Fahrten sollten spaeter ueber GTFS/RMV-Daten im Backend importiert werden.
