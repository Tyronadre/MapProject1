# Spielkarten-Konzept: IRL Hide and Seek mit oeffentlichen Verkehrsmitteln

## 1. Ziel

Es soll eine mobile Website entstehen, die eine reale Karte als Spielfeld nutzt. Ein versteckter Spieler befindet sich irgendwo innerhalb einer definierten Spielgrenze. Zwei Suchende bewegen sich mit oeffentlichen Verkehrsmitteln durch die reale Umgebung und stellen regelbasierte Fragen. Jede Antwort schliesst Teile der Karte aus, bis die verbleibende Suchflaeche klein genug ist, um den versteckten Spieler zu finden.

Die Anwendung soll:

- auf Smartphones gut bedienbar sein,
- die reale Weltkarte anzeigen,
- eine Spielgrenze und die verbleibende Suchflaeche visualisieren,
- Fragen aus einem festen Katalog auswerten,
- Antworten speichern und daraus Ausschlussflaechen berechnen,
- selbst hostbar und mit ueblichen Technologien umsetzbar sein.

## 2. Empfohlene Plattform

Empfehlung fuer die erste produktive Version:

- Backend: Python mit FastAPI
- Geometrie: Shapely, GeoPandas, PyProj, H3
- Datenbank: PostgreSQL mit PostGIS
- Frontend: React mit Leaflet oder MapLibre GL JS
- Deployment: Docker Compose

Warum Python/FastAPI:

- sehr gut geeignet fuer Geodatenverarbeitung,
- gute Bibliotheken fuer Karten-, Distanz- und Polygonlogik,
- einfach als REST-API zu betreiben,
- ueblich, leicht dokumentierbar und gut selbst hostbar.

Java-Alternative:

- Spring Boot, JTS Topology Suite, PostGIS, Hibernate Spatial
- sinnvoll, wenn das Projekt langfristig in einem Java-Umfeld gepflegt werden soll.

Fuer dieses Projekt ist Python/FastAPI die pragmatischere Wahl, weil die Geodaten- und Analysebibliotheken dort schneller zu einem funktionierenden MVP fuehren.

## 3. Kernbegriffe

- Spielgrenze: Polygon, in dem sich der versteckte Spieler befinden darf.
- Suchflaeche: aktuell noch moegliche Positionen des versteckten Spielers.
- Ausschlussflaeche: Bereich, der durch eine Antwort nicht mehr moeglich ist.
- Sucherposition: aktuelle oder manuell gesetzte Position eines Suchenden.
- Frage: regelbasierte Aktion, die auf Karte und Geodaten angewandt wird.
- Antwort: Ja/Nein, naeher/weiter oder eine vergleichbare Regelentscheidung.
- Kandidatenzelle: kleine Kartenzelle, die als moeglicher Aufenthaltsort zaehlt.

## 4. Wichtige Designentscheidung: Grid statt sofort perfekter Polygone

Exakte Geometrie fuer alle Fragen ist komplex, besonders bei "nearest"-Fragen, Strassen, Admin-Grenzen, Wasser, Bahnlinien und unvollstaendigen OSM-Daten. Fuer ein stabiles MVP sollte die Spielzone in kleine Zellen aufgeteilt werden, zum Beispiel mit H3-Hexagons.

Jede Zelle bekommt vorberechnete Eigenschaften:

- Mittelpunkt und Zellpolygon,
- enthaltene Admin-Gebiete,
- naechste relevante Orte je Kategorie,
- Distanz zu relevanten Features,
- Hoehe ueber Meeresspiegel, falls Hoehendaten vorhanden sind,
- Status: moeglich, ausgeschlossen oder unsicher.

Vorteile:

- alle Fragetypen lassen sich einheitlich auswerten,
- die App bleibt auch auf Mobile schnell,
- ungenaue Daten koennen durch Toleranzen behandelt werden,
- der Spielzustand ist leicht zu speichern und zu synchronisieren.

Empfohlene Zellgroesse:

- Innenstadt oder kleines Spielfeld: 50 bis 100 Meter
- Stadt/Region: 100 bis 250 Meter
- groesseres Bahnspiel: 250 bis 500 Meter

Die App sollte nie eine Zelle sicher ausschliessen, wenn die Datenlage an der Zellgrenze uneindeutig ist. Solche Zellen bleiben als "unsicher" sichtbar oder werden konservativ in der Suchflaeche behalten.

## 5. Grundfunktionen der Oberflaeche

Die erste Ansicht ist keine Landingpage, sondern direkt die Spielkarte.

Mobile Layout:

- Vollbildkarte als Hauptbereich
- obere Leiste mit Spielname, verbleibender Flaeche und Undo/History
- unteres Sheet fuer Fragen, Antworten und Filter
- gut erreichbare Buttons fuer "Meine Position", "Frage stellen", "Antwort anwenden"
- visuelle Layer fuer Spielgrenze, verbleibende Suchflaeche und ausgeschlossene Bereiche

Kartenfunktionen:

- Spielgrenze anzeigen
- Suchflaeche anzeigen
- ausgeschlossene Flaechen halbtransparent anzeigen
- Sucherposition setzen oder per GPS uebernehmen
- Frage aus Katalog waehlen
- Antwort eingeben
- Vorschau anzeigen, bevor die Antwort final angewendet wird
- Frage rueckgaengig machen
- History aller Fragen anzeigen

## 6. Fragetypen

### 6.1 Matching-Fragen

Format:

> Is your nearest _ the same as my _?

Antwort:

- Ja
- Nein

Regel:

Fuer die aktuelle Sucherposition wird das passende Referenzmerkmal bestimmt. Danach wird fuer jede Kandidatenzelle geprueft, ob ihr entsprechendes Merkmal gleich ist. Bei "Ja" bleiben gleiche Zellen erhalten. Bei "Nein" werden gleiche Zellen ausgeschlossen.

Wichtig:

- Locations ausserhalb der Spielgrenze zaehlen nicht.
- Bei Gleichstand oder fehlenden Daten sollte eine Zelle als unsicher gelten.

Kategorien:

- commercial airport
- transit line
- station name length
- name of the street or path
- 1st administrative division
- 2nd administrative division
- 3rd administrative division
- 4th administrative division
- mountain
- park
- amusement park
- zoo
- aquarium
- golf course, excluding miniature golf
- museum
- movie theatre
- hospital
- library
- foreign consulate

Spezialfaelle:

- Transit line: benoetigt idealerweise GTFS-Daten oder sauber gepflegte OSM-Relationen. Die Regel sollte klaeren, ob es um die Linie geht, auf der die Suchenden gerade fahren, oder um die naechste Station des versteckten Spielers.
- Station name length: sollte als Laenge des Namens der naechsten relevanten Station definiert werden. Leerzeichen, Bindestriche und Sonderzeichen muessen einheitlich behandelt werden.
- Street or path: sollte die naechste benannte Strasse oder der Weg sein. Unbenannte Wege koennen ignoriert oder als "unknown" behandelt werden.
- Administrative divisions: die OSM-admin_level unterscheiden sich je Land. Das Projekt braucht eine Konfiguration pro Land/Spielgebiet.

### 6.2 Measuring-Fragen

Format:

> Compared to me, are you closer or further from _?

Antwort:

- Closer
- Further

Regel:

Fuer die aktuelle Sucherposition wird die Distanz zum Zieltyp berechnet. Fuer jede Kandidatenzelle wird dieselbe Distanz berechnet. Bei "closer" bleiben Zellen erhalten, deren Distanz kleiner ist. Bei "further" bleiben Zellen erhalten, deren Distanz groesser ist.

Kategorien:

- commercial airport
- high speed train line
- rail stations
- international border
- 1st administrative division border
- 2nd administrative division border
- sea level
- body of water
- coastline
- mountain
- park
- amusement park
- zoo
- aquarium
- golf course
- museum
- movie theater
- hospital
- library
- foreign consulate

Spezialfaelle:

- Sea level: nicht horizontale Entfernung, sondern Hoehe relativ zu 0 Metern. Dafuer werden Hoehendaten benoetigt.
- Border-Fragen: Distanz zur Grenzlinie, nicht zum Mittelpunkt eines Gebietes.
- Body of water und coastline sollten getrennte Layer sein.
- High speed train line braucht regionale Definition, zum Beispiel GTFS route_type, OSM railway tags oder manuelle Linienliste.

### 6.3 Radar-Fragen

Format:

> Are you within _ km of me?

Antwort:

- Ja
- Nein

Vordefinierte Distanzen:

- 400 m
- 800 m
- 1.6 km
- 4.8 km
- 8 km
- 16 km
- 40 km
- 80 km
- 160 km
- frei gewaehlte Distanz

Regel:

Von der Sucherposition wird ein Kreis mit dem gewaehlten Radius gebildet. Bei "Ja" bleibt die Suchflaeche innerhalb des Kreises erhalten. Bei "Nein" bleibt die Suchflaeche ausserhalb des Kreises erhalten.

Grid-Regel:

Eine Zelle sollte nur ausgeschlossen werden, wenn sie eindeutig auf der falschen Seite liegt. Zellen, die den Kreis schneiden, koennen konservativ behalten oder als unsicher markiert werden.

### 6.4 Thermometer-Fragen

Format:

> After traveling for _ km, am I closer or further away from you?

Antwort:

- Closer
- Further

Vordefinierte Distanzen:

- 800 m
- 4.8 km
- 16 km

Regel:

Die Suchenden starten an Punkt A, reisen die gewaehlte Strecke und stoppen an Punkt B. Fuer jede moegliche Hider-Position wird verglichen:

- Distanz von A zur Kandidatenzelle
- Distanz von B zur Kandidatenzelle

Wenn die Antwort "closer" ist, bleiben Zellen erhalten, die naeher an B als an A liegen. Wenn die Antwort "further" ist, bleiben Zellen erhalten, die naeher an A als an B liegen.

Geometrisch entspricht das einer Teilung der Karte durch die Mittelsenkrechte zwischen A und B. In der Grid-Version wird das ueber Distanzen zum Zellmittelpunkt oder konservativ ueber das Zellpolygon berechnet.

## 7. Geodaten

Primaere Datenquellen:

- OpenStreetMap fuer POIs, Strassen, Parks, Krankenhaeuser, Bibliotheken, Museen, Grenzen, Wasser und viele Bahnobjekte
- GTFS fuer verlaessliche oeffentliche Verkehrslinien und Haltestellen
- Hoehendaten wie SRTM oder Copernicus DEM fuer "sea level"
- Natural Earth oder OSM-Grenzdaten fuer internationale Grenzen und Kuestenlinien
- OurAirports oder aehnliche Datenquelle fuer kommerzielle Flughaefen

OSM-Tag-Beispiele:

- airport: aeroway=aerodrome, plus Zusatzdaten fuer kommerziellen Verkehr
- rail station: railway=station oder public_transport=station
- mountain: natural=peak
- park: leisure=park oder boundary=protected_area, je nach Regel
- amusement park: tourism=theme_park
- zoo: tourism=zoo
- aquarium: tourism=aquarium
- golf course: leisure=golf_course, miniature_golf ausschliessen
- museum: tourism=museum
- movie theatre: amenity=cinema
- hospital: amenity=hospital
- library: amenity=library
- foreign consulate: office=diplomatic oder amenity=embassy mit passender diplomatischer Rolle
- street/path: highway=* mit name
- water: natural=water, waterway=*, coastline separat

Lizenzhinweis:

Bei Nutzung von OpenStreetMap-Daten muss die ODbL-Lizenz und die korrekte Attribution beachtet werden. Die Karte sollte sichtbar "© OpenStreetMap contributors" oder die vom Tile-Anbieter geforderte Attribution anzeigen.

## 8. Datenmodell

Wichtige Tabellen oder Collections:

- games
- players
- game_bounds
- grid_cells
- cell_attributes
- questions
- question_results
- map_layers
- data_imports

Beispiel fuer `games`:

- id
- name
- created_at
- status
- bounds_geometry
- grid_resolution
- remaining_cell_count

Beispiel fuer `grid_cells`:

- id
- game_id
- h3_index
- geometry
- center_lat
- center_lng
- status

Beispiel fuer `cell_attributes`:

- cell_id
- nearest_airport_id
- nearest_station_id
- nearest_station_name_length
- nearest_street_name
- admin_division_1
- admin_division_2
- admin_division_3
- admin_division_4
- distance_airport_m
- distance_rail_station_m
- distance_water_m
- distance_coastline_m
- elevation_m

Beispiel fuer `questions`:

- id
- game_id
- type
- category
- seeker_position
- answer
- created_at
- applied_at
- cells_before
- cells_after
- excluded_cells
- notes

## 9. API-Entwurf

Minimaler REST-API-Entwurf:

```http
POST /api/games
GET  /api/games/{game_id}
POST /api/games/{game_id}/bounds
GET  /api/games/{game_id}/state
GET  /api/games/{game_id}/cells.geojson
POST /api/games/{game_id}/questions/preview
POST /api/games/{game_id}/questions/apply
POST /api/games/{game_id}/questions/{question_id}/undo
POST /api/games/{game_id}/players/{player_id}/position
```

Beispiel fuer eine Radar-Frage:

```json
{
  "type": "radar",
  "seeker_position": {
    "lat": 52.5208,
    "lng": 13.4095
  },
  "radius_m": 4800,
  "answer": "yes"
}
```

Beispiel fuer eine Matching-Frage:

```json
{
  "type": "matching",
  "category": "museum",
  "seeker_position": {
    "lat": 52.5208,
    "lng": 13.4095
  },
  "answer": "no"
}
```

Beispiel fuer eine Thermometer-Frage:

```json
{
  "type": "thermometer",
  "start_position": {
    "lat": 52.5208,
    "lng": 13.4095
  },
  "end_position": {
    "lat": 52.5340,
    "lng": 13.3920
  },
  "travel_distance_m": 4800,
  "answer": "closer"
}
```

## 10. Ausschlusslogik

Die zentrale Backend-Komponente ist eine Question Engine.

Eingaben:

- aktueller Spielzustand
- aktive Kandidatenzellen
- Frage
- Sucherposition oder Start-/Endpunkt
- Antwort

Ausgaben:

- neue Suchflaeche
- ausgeschlossene Zellen
- unsichere Zellen
- Statistik fuer die UI

Grundsatz:

Das System sollte lieber zu viele Zellen behalten als die echte Position versehentlich auszuschliessen. Deshalb braucht jede Regel Toleranzen.

Beispiele:

- GPS-Ungenauigkeit: 20 bis 50 m
- Zellgroesse: je nach Spielgebiet
- Feature-Gleichstand: nicht ausschliessen
- fehlendes Feature: als unknown behandeln und in der UI kennzeichnen

## 11. MVP-Plan

### Phase 1: Kartenbasis

- mobile Webkarte anzeigen
- Spielgrenze manuell zeichnen oder importieren
- Suchflaeche als Grid generieren
- Zellen farbig darstellen
- Spielzustand lokal oder in einfacher Datenbank speichern

### Phase 2: Einfache Fragen

- Radar-Fragen implementieren
- Thermometer-Fragen implementieren
- Vorschau vor dem Anwenden einer Antwort
- Undo fuer letzte Frage

Diese Phase funktioniert fast ohne externe Geodaten und prueft die wichtigste UX.

### Phase 3: OSM- und Distanzfragen

- OSM-Daten fuer das Spielgebiet importieren
- POI-Kategorien normalisieren
- Distanzwerte pro Zelle vorberechnen
- Measuring-Fragen fuer POIs, Wasser, Grenzen und Stationen implementieren

### Phase 4: Matching-Fragen

- naechste Features pro Zelle vorberechnen
- Admin-Gebiete pro Zelle bestimmen
- Strassen-/Pfadnamen bestimmen
- Matching-Regeln mit Ja/Nein-Antworten implementieren

### Phase 5: Verkehrslinien

- GTFS-Daten importieren
- Haltestellen, Linien und Stop-Sequenzen modellieren
- Transit-line-Frage sauber definieren und implementieren
- optional: aktuelle Linie des Suchers manuell auswaehlen

### Phase 6: Spielbarkeit und Hosting

- Login oder Spielcode
- mehrere Suchende in einer Session
- Live-Sync per WebSocket oder Polling
- Docker Compose Setup
- Export/Import von Spielstaenden
- Tests fuer jede Fragenregel

## 12. Vorgeschlagene Repository-Struktur

```text
MapProject1/
  backend/
    app/
      main.py
      api/
      core/
      geodata/
      questions/
      models/
    tests/
    pyproject.toml
    Dockerfile
  frontend/
    src/
      components/
      map/
      questions/
      state/
    package.json
    Dockerfile
  data/
    imports/
    processed/
  docs/
    spielkarten-konzept.md
  docker-compose.yml
  README.md
```

## 13. Tests

Wichtige Tests:

- Radar: Kreis innen/aussen, Grenzfaelle, freie Distanz
- Thermometer: Punkt A/B, Mittelsenkrechte, Gleichstand
- Matching: gleiche/ungleiche naechste Features, fehlende Daten
- Measuring: Distanzvergleich fuer Punkte, Linien und Polygone
- Admin-Divisionen: korrekte Zuordnung innerhalb des Spielgebiets
- Undo: Wiederherstellung des vorherigen Spielzustands
- API: Preview veraendert den Spielzustand nicht, Apply schon

Zusaetzlich sollten kleine Beispielkarten als Fixtures angelegt werden, damit die Regeln ohne grosse OSM-Downloads getestet werden koennen.

## 14. Offene Entscheidungen

Vor der Implementierung sollten diese Punkte festgelegt werden:

- In welcher Stadt oder Region soll die erste Karte funktionieren?
- Wie gross ist ein typisches Spielfeld?
- Soll das Spiel online synchronisiert werden oder reicht ein Geraet als Spielleiter?
- Wie genau muss die Karte sein, damit das Spiel fair wirkt?
- Sollen Suchende ihre GPS-Position live teilen?
- Soll der versteckte Spieler seine Position jemals in der App speichern?
- Welche Verkehrsdaten sind fuer die Zielregion verfuegbar?
- Welche OSM-Kategorien sollen manuell nachkorrigiert werden?
- Wie wird bei unklaren Antworten oder Datenfehlern verfahren?

## 15. Empfohlener Start

Der beste erste Implementierungsschritt ist nicht der komplette Fragenkatalog, sondern ein spielbarer Kern:

1. FastAPI-Backend mit Game-State-Modell
2. React-Karte mit Spielgrenze und Grid
3. Radar-Frage
4. Thermometer-Frage
5. Preview und Apply
6. Undo

Danach koennen OSM-Daten und die komplexeren Matching-/Measuring-Fragen Schritt fuer Schritt eingebaut werden.

