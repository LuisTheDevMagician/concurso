import { db } from "./db";
import type {
  Concurso,
  Disciplina,
  Materia,
  WithProgress,
  RevisaoComMateria,
} from "./types";

function parseLinks<T extends { links: unknown }>(
  row: T
): Omit<T, "links"> & { links: string[] } {
  return { ...row, links: JSON.parse(row.links as string) };
}

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
  const rows = db
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
  return rows.map(parseLinks);
}

export function getDisciplina(id: number): Disciplina | undefined {
  const row = db.prepare(`SELECT * FROM disciplinas WHERE id = ?`).get(id) as
    | Disciplina
    | undefined;
  return row ? parseLinks(row) : undefined;
}

export function getMaterias(disciplinaId: number): Materia[] {
  const rows = db
    .prepare(
      `SELECT * FROM materias WHERE disciplina_id = ? ORDER BY created_at ASC`
    )
    .all(disciplinaId) as Array<Omit<Materia, "estudado"> & { estudado: number }>;
  return rows.map((row) => parseLinks({ ...row, estudado: row.estudado === 1 }));
}

export function getConcursosParaCalendario(): (Concurso & {
  diasSemana: string[];
})[] {
  const concursos = db
    .prepare(`SELECT * FROM concursos ORDER BY created_at ASC`)
    .all() as Concurso[];
  const rows = db
    .prepare(`SELECT concurso_id, dias_semana FROM disciplinas WHERE dias_semana != ''`)
    .all() as { concurso_id: number; dias_semana: string }[];

  const diasPorConcurso = new Map<number, Set<string>>();
  for (const row of rows) {
    const set = diasPorConcurso.get(row.concurso_id) ?? new Set<string>();
    for (const dia of row.dias_semana.split(",").filter(Boolean)) {
      set.add(dia);
    }
    diasPorConcurso.set(row.concurso_id, set);
  }

  return concursos.map((c) => ({
    ...c,
    diasSemana: Array.from(diasPorConcurso.get(c.id) ?? []),
  }));
}

export function getConcursosComDia(dia: string): (Concurso & WithProgress)[] {
  return db
    .prepare(
      `SELECT
        c.*,
        COUNT(m.id) AS total,
        COALESCE(SUM(m.estudado), 0) AS estudadas
      FROM concursos c
      INNER JOIN disciplinas d ON d.concurso_id = c.id
        AND (',' || d.dias_semana || ',') LIKE ('%,' || ? || ',%')
      LEFT JOIN materias m ON m.disciplina_id = d.id
      GROUP BY c.id
      ORDER BY c.created_at ASC`
    )
    .all(dia) as (Concurso & WithProgress)[];
}

export function getMateriasDoConcurso(
  concursoId: number
): (Materia & { disciplina_nome: string; disciplina_cor: string })[] {
  const rows = db
    .prepare(
      `SELECT m.*, d.nome AS disciplina_nome, d.cor AS disciplina_cor
      FROM materias m
      INNER JOIN disciplinas d ON d.id = m.disciplina_id
      WHERE d.concurso_id = ?
      ORDER BY d.nome ASC, m.nome ASC`
    )
    .all(concursoId) as (Materia & {
    disciplina_nome: string;
    disciplina_cor: string;
  })[];
  return rows.map(parseLinks);
}

export function getRevisoesDoConcurso(concursoId: number): RevisaoComMateria[] {
  return db
    .prepare(
      `SELECT
        r.*,
        m.nome AS materia_nome,
        d.id AS disciplina_id,
        d.nome AS disciplina_nome,
        d.cor AS disciplina_cor
      FROM revisoes r
      INNER JOIN materias m ON m.id = r.materia_id
      INNER JOIN disciplinas d ON d.id = m.disciplina_id
      WHERE d.concurso_id = ?
      ORDER BY r.data ASC`
    )
    .all(concursoId) as RevisaoComMateria[];
}
