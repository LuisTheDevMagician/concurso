import { db } from "./db";
import type { Concurso, Disciplina, Materia, WithProgress } from "./types";

export function getConcursos(): (Concurso & WithProgress)[] {
  return db
    .prepare(
      `SELECT
        c.*,
        COUNT(m.id) AS total,
        COALESCE(SUM(m.estudado), 0) AS estudadas
      FROM concursos c
      LEFT JOIN disciplinas d ON d.concurso_id = c.id
      LEFT JOIN materias m ON m.disciplina_id = d.id
      GROUP BY c.id
      ORDER BY c.created_at ASC`
    )
    .all() as (Concurso & WithProgress)[];
}

export function getConcurso(id: number): Concurso | undefined {
  return db.prepare(`SELECT * FROM concursos WHERE id = ?`).get(id) as
    | Concurso
    | undefined;
}

export function getDisciplinas(
  concursoId: number
): (Disciplina & WithProgress)[] {
  return db
    .prepare(
      `SELECT
        d.*,
        COUNT(m.id) AS total,
        COALESCE(SUM(m.estudado), 0) AS estudadas
      FROM disciplinas d
      LEFT JOIN materias m ON m.disciplina_id = d.id
      WHERE d.concurso_id = ?
      GROUP BY d.id
      ORDER BY d.created_at ASC`
    )
    .all(concursoId) as (Disciplina & WithProgress)[];
}

export function getDisciplina(id: number): Disciplina | undefined {
  return db.prepare(`SELECT * FROM disciplinas WHERE id = ?`).get(id) as
    | Disciplina
    | undefined;
}

export function getMaterias(disciplinaId: number): Materia[] {
  return db
    .prepare(
      `SELECT * FROM materias WHERE disciplina_id = ? ORDER BY created_at ASC`
    )
    .all(disciplinaId) as Materia[];
}
