# Backend

FastAPI-Backend fuer Spielzustand, Antwort-History und gecachte Kartendaten.

## Installation

```powershell
cd backend
python -m pip install -r requirements.txt
```

## Start

```powershell
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Danach ist die API unter `http://127.0.0.1:8000` erreichbar.

## Start mit Docker

Vom Projektroot:

```powershell
docker compose up --build backend
```

Der Container erstellt eine eigene venv unter `/opt/venv`, installiert `requirements.txt` dort hinein und startet `uvicorn` auf Port `8000`.

Die SQLite-Datenbank wird ueber ein Volume nach `backend/data/mapgame.db` geschrieben.

## Wichtige Endpoints

- `GET /health`
- `POST /api/games`
- `GET /api/games/{game_id}`
- `POST /api/games/{game_id}/bounds`
- `POST /api/games/{game_id}/answers`
- `GET /api/games/{game_id}/answers`
- `PUT /api/games/{game_id}/answers/{answer_id}`
- `POST /api/map/pins`
- `POST /api/map/transit`
- `POST /api/map/transit-lines`
- `GET /api/cache/stats`

## Cache

Pins, OePNV-Strecken und OePNV-Linien werden nach Kartenausschnitt und Kategorie in SQLite gecached. Der Cache liegt standardmaessig in:

```text
backend/data/mapgame.db
```

Um einen anderen Pfad zu verwenden:

```powershell
$env:MAPGAME_DB_PATH="C:\path\to\mapgame.db"
```

Der Cache nutzt einen gerundeten Kartenausschnitt, damit kleine Verschiebungen der Karte nicht jedes Mal neue Overpass-Abfragen ausloesen.
