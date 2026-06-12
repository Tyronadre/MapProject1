from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator


SCHEMA = """
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  bounds_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  question_type TEXT NOT NULL,
  category TEXT,
  question_text TEXT,
  answer TEXT NOT NULL,
  seeker_position_json TEXT,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_answers_game_created ON answers(game_id, created_at);

CREATE TABLE IF NOT EXISTS cache_entries (
  key TEXT PRIMARY KEY,
  data_type TEXT NOT NULL,
  bbox_south REAL NOT NULL,
  bbox_west REAL NOT NULL,
  bbox_north REAL NOT NULL,
  bbox_east REAL NOT NULL,
  categories_json TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  source TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_type_expires ON cache_entries(data_type, expires_at);
"""


class Database:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    @contextmanager
    def connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.path)
        connection.row_factory = sqlite3.Row
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def init(self) -> None:
        with self.connect() as connection:
            connection.executescript(SCHEMA)

    def create_game(self, game: dict[str, Any]) -> dict[str, Any]:
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO games (id, name, status, bounds_json, created_at, updated_at)
                VALUES (:id, :name, :status, :bounds_json, :created_at, :updated_at)
                """,
                {
                    **game,
                    "bounds_json": json.dumps(game.get("bounds")),
                },
            )

        return game

    def get_game(self, game_id: str) -> dict[str, Any] | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM games WHERE id = ?", (game_id,)).fetchone()

        return row_to_game(row) if row else None

    def update_game_bounds(self, game_id: str, bounds: list[dict[str, float]], updated_at: str) -> dict[str, Any] | None:
        with self.connect() as connection:
            connection.execute(
                """
                UPDATE games
                SET bounds_json = ?, updated_at = ?
                WHERE id = ?
                """,
                (json.dumps(bounds), updated_at, game_id),
            )
            row = connection.execute("SELECT * FROM games WHERE id = ?", (game_id,)).fetchone()

        return row_to_game(row) if row else None

    def create_answer(self, answer: dict[str, Any]) -> dict[str, Any]:
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO answers (
                  id, game_id, question_type, category, question_text, answer,
                  seeker_position_json, payload_json, created_at
                )
                VALUES (
                  :id, :game_id, :question_type, :category, :question_text, :answer,
                  :seeker_position_json, :payload_json, :created_at
                )
                """,
                {
                    **answer,
                    "seeker_position_json": json.dumps(answer.get("seeker_position")),
                    "payload_json": json.dumps(answer.get("payload", {})),
                },
            )

        return answer

    def list_answers(self, game_id: str) -> list[dict[str, Any]]:
        with self.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM answers WHERE game_id = ? ORDER BY created_at ASC",
                (game_id,),
            ).fetchall()

        return [row_to_answer(row) for row in rows]

    def update_answer(self, game_id: str, answer_id: str, answer: dict[str, Any]) -> dict[str, Any] | None:
        with self.connect() as connection:
            connection.execute(
                """
                UPDATE answers
                SET question_type = :question_type,
                    category = :category,
                    question_text = :question_text,
                    answer = :answer,
                    seeker_position_json = :seeker_position_json,
                    payload_json = :payload_json
                WHERE game_id = :game_id AND id = :id
                """,
                {
                    **answer,
                    "id": answer_id,
                    "game_id": game_id,
                    "seeker_position_json": json.dumps(answer.get("seeker_position")),
                    "payload_json": json.dumps(answer.get("payload", {})),
                },
            )
            row = connection.execute(
                "SELECT * FROM answers WHERE game_id = ? AND id = ?",
                (game_id, answer_id),
            ).fetchone()

        return row_to_answer(row) if row else None

    def delete_answer(self, game_id: str, answer_id: str) -> bool:
        with self.connect() as connection:
            cursor = connection.execute(
                "DELETE FROM answers WHERE game_id = ? AND id = ?",
                (game_id, answer_id),
            )

        return cursor.rowcount > 0

    def get_cache(self, key: str, now: int) -> dict[str, Any] | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT * FROM cache_entries WHERE key = ? AND expires_at > ?",
                (key, now),
            ).fetchone()

        if not row:
            return None

        return {
            "payload": json.loads(row["payload_json"]),
            "created_at": row["created_at"],
            "expires_at": row["expires_at"],
        }

    def set_cache(
        self,
        *,
        key: str,
        data_type: str,
        bounds: dict[str, float],
        categories: list[str],
        payload: dict[str, Any],
        created_at: int,
        expires_at: int,
        source: str,
    ) -> None:
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO cache_entries (
                  key, data_type, bbox_south, bbox_west, bbox_north, bbox_east,
                  categories_json, payload_json, created_at, expires_at, source
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(key) DO UPDATE SET
                  payload_json = excluded.payload_json,
                  created_at = excluded.created_at,
                  expires_at = excluded.expires_at,
                  source = excluded.source
                """,
                (
                    key,
                    data_type,
                    bounds["south"],
                    bounds["west"],
                    bounds["north"],
                    bounds["east"],
                    json.dumps(categories),
                    json.dumps(payload),
                    created_at,
                    expires_at,
                    source,
                ),
            )

    def cache_stats(self, now: int) -> dict[str, int]:
        with self.connect() as connection:
            rows = connection.execute(
                """
                SELECT
                  COUNT(*) AS entries,
                  SUM(CASE WHEN data_type = 'pins' THEN 1 ELSE 0 END) AS pins_entries,
                  SUM(CASE WHEN data_type = 'transit' THEN 1 ELSE 0 END) AS transit_entries,
                  SUM(CASE WHEN data_type = 'transit_lines' THEN 1 ELSE 0 END) AS transit_line_entries,
                  SUM(CASE WHEN expires_at <= ? THEN 1 ELSE 0 END) AS expired_entries
                FROM cache_entries
                """,
                (now,),
            ).fetchone()

        return {
            "entries": int(rows["entries"] or 0),
            "pins_entries": int(rows["pins_entries"] or 0),
            "transit_entries": int(rows["transit_entries"] or 0),
            "transit_line_entries": int(rows["transit_line_entries"] or 0),
            "expired_entries": int(rows["expired_entries"] or 0),
        }


def row_to_game(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "status": row["status"],
        "bounds": json.loads(row["bounds_json"]) if row["bounds_json"] else None,
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def row_to_answer(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "game_id": row["game_id"],
        "question_type": row["question_type"],
        "category": row["category"],
        "question_text": row["question_text"],
        "answer": row["answer"],
        "seeker_position": json.loads(row["seeker_position_json"]) if row["seeker_position_json"] else None,
        "payload": json.loads(row["payload_json"]),
        "created_at": row["created_at"],
    }
