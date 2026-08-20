import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(
  process.env.HOME ?? process.env.USERPROFILE ?? process.cwd(),
  ".local",
  "share",
  "concurso-tracker"
);
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "concurso.db"));
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS concursos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cor TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS disciplinas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    concurso_id INTEGER NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cor TEXT NOT NULL DEFAULT '#6366f1',
    dias_semana TEXT NOT NULL DEFAULT '',
    link_material TEXT,
    links TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS materias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    estudado INTEGER NOT NULL DEFAULT 0,
    link TEXT,
    links TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS revisoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    revisao_numero INTEGER NOT NULL CHECK(revisao_numero BETWEEN 1 AND 4),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const disciplinaColumns = db
  .prepare(`PRAGMA table_info(disciplinas)`)
  .all() as { name: string }[];
if (!disciplinaColumns.some((c) => c.name === "link_material")) {
  db.exec(`ALTER TABLE disciplinas ADD COLUMN link_material TEXT`);
}
if (!disciplinaColumns.some((c) => c.name === "links")) {
  db.exec(`ALTER TABLE disciplinas ADD COLUMN links TEXT NOT NULL DEFAULT '[]'`);
  for (const row of db
    .prepare(`SELECT id, link_material FROM disciplinas WHERE link_material IS NOT NULL AND link_material != ''`)
    .all() as { id: number; link_material: string }[]) {
    db.prepare(`UPDATE disciplinas SET links = ? WHERE id = ?`).run(
      JSON.stringify([row.link_material]),
      row.id
    );
  }
}

const materiaColumns = db
  .prepare(`PRAGMA table_info(materias)`)
  .all() as { name: string }[];
if (!materiaColumns.some((c) => c.name === "link")) {
  db.exec(`ALTER TABLE materias ADD COLUMN link TEXT`);
}
if (!materiaColumns.some((c) => c.name === "links")) {
  db.exec(`ALTER TABLE materias ADD COLUMN links TEXT NOT NULL DEFAULT '[]'`);
  for (const row of db
    .prepare(`SELECT id, link FROM materias WHERE link IS NOT NULL AND link != ''`)
    .all() as { id: number; link: string }[]) {
    db.prepare(`UPDATE materias SET links = ? WHERE id = ?`).run(
      JSON.stringify([row.link]),
      row.id
    );
  }
}
