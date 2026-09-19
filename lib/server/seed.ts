import { database, one, uid } from "./database";
import {
  OFFICIAL_DEBATES,
  SURVEY_QUESTIONS,
  PROVINCES,
  CATEGORIES,
} from "../content";
export async function ensureCatalog() {
  if (await one("SELECT value FROM settings WHERE key = ?", "catalog-v1"))
    return;
  const db = database();
  const statements = [
    db
      .prepare(
        "INSERT INTO profiles (id,alias,role) VALUES (?,?,?) ON CONFLICT(id) DO NOTHING",
      )
      .bind("editorial-alerta-rd", "Alerta RD", "editorial"),
    db
      .prepare(
        "INSERT INTO polls (id,title,description,questions) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING",
      )
      .bind(
        "ciudadana-v1",
        "Tu voz puede hacer la diferencia",
        "13 preguntas para construir una propuesta más útil, segura y cercana a las personas.",
        JSON.stringify(SURVEY_QUESTIONS),
      ),
    ...PROVINCES.map((x) =>
      db
        .prepare(
          "INSERT INTO provinces (name) VALUES (?) ON CONFLICT(name) DO NOTHING",
        )
        .bind(x),
    ),
    ...CATEGORIES.map((x) =>
      db
        .prepare(
          "INSERT INTO forum_categories (name) VALUES (?) ON CONFLICT(name) DO NOTHING",
        )
        .bind(x),
    ),
    ...OFFICIAL_DEBATES.map((t) =>
      db
        .prepare(
          "INSERT INTO forum_threads (id,profile_id,title,body,category,status,official,featured) VALUES (?,?,?,?,?,?,1,1) ON CONFLICT(id) DO NOTHING",
        )
        .bind(
          t.id,
          "editorial-alerta-rd",
          t.title,
          t.body,
          t.category,
          "approved",
        ),
    ),
    db
      .prepare(
        "INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO NOTHING",
      )
      .bind("catalog-v1", "1"),
  ];
  await db.batch(statements);
}
