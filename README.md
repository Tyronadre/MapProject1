# IRL Hide and Seek Map

Dieses Projekt beschreibt und implementiert eine mobile Webkarte fuer ein IRL-Hide-and-Seek-Spiel mit oeffentlichen Verkehrsmitteln.

Ein Spieler versteckt sich in einer vorher festgelegten Spielzone. Zwei Suchende bewegen sich real durch die Umgebung und stellen Fragen, deren Antworten die verbleibende Suchflaeche auf der Karte einschraenken.

## Empfohlener technischer Ansatz

- Frontend: mobile Web-App mit React und Leaflet oder MapLibre GL JS
- Backend: Python mit FastAPI
- Geodaten: OpenStreetMap-basierte Daten, optional GTFS fuer Verkehrslinien
- Raumlogik: H3/Hex-Zellen oder ein aehnliches Grid fuer das MVP
- Persistenz: PostgreSQL/PostGIS, fuer fruehe Prototypen auch SQLite/GeoPackage
- Deployment: Docker Compose fuer einfache Selbst-Hosting-Setups

## Dokumentation

Das Produkt- und Technik-Konzept liegt hier:

- [docs/spielkarten-konzept.md](docs/spielkarten-konzept.md)

## Erster Karten-Prototyp

Der aktuelle Frontend-Prototyp liegt unter:

- [frontend/index.html](frontend/index.html)

Direkt im Browser oeffnen:

```text
frontend/index.html
```

Optional mit lokalem Server starten:

```powershell
cd frontend
python -m http.server 5173 --bind 127.0.0.1
```

Danach im Browser oeffnen:

```text
http://127.0.0.1:5173
```

Der Prototyp kann bereits Spielgrenzen zeichnen, Sucherpositionen setzen, Radar-Kreise anzeigen, frage-relevante Pins aus OpenStreetMap/Overpass laden und rail-bound OePNV-Linien im Raum Frankfurt/RMV mit Stationen einzeichnen.

## Backend

Das Backend liegt unter:

- [backend/](backend/)

Es speichert Spiele und Antworten und cached Pins sowie OePNV-Linien fuer Kartenausschnitte.

Start:

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Oder per Docker vom Projektroot:

```powershell
docker compose up --build backend
```

Wenn das Backend laeuft, nutzt das Frontend automatisch `http://127.0.0.1:8000` fuer Pins und OePNV-Linien. Wenn es nicht laeuft, faellt das Frontend auf direkte Overpass-Abfragen zurueck.
