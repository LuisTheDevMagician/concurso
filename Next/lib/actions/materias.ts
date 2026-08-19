"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type MateriaFormState = { error?: string };

function validateNome(nome: FormDataEntryValue | null) {
  const nomeStr = String(nome ?? "").trim();
  if (!nomeStr) return { error: "Nome não pode ser vazio." } as const;
  return { nome: nomeStr } as const;
}

export async function createMateria(
  disciplinaId: number,
  _prevState: MateriaFormState,
  formData: FormData
): Promise<MateriaFormState> {
  const result = validateNome(formData.get("nome"));
  if ("error" in result) return result;

  db.prepare(`INSERT INTO materias (disciplina_id, nome) VALUES (?, ?)`).run(
    disciplinaId,
    result.nome
  );
  revalidatePath("/", "layout");
  return {};
}

export async function updateMateria(
  id: number,
  _prevState: MateriaFormState,
  formData: FormData
): Promise<MateriaFormState> {
  const result = validateNome(formData.get("nome"));
  if ("error" in result) return result;

  db.prepare(`UPDATE materias SET nome = ? WHERE id = ?`).run(result.nome, id);
  revalidatePath("/", "layout");
  return {};
}

export async function deleteMateria(id: number) {
  db.prepare(`DELETE FROM materias WHERE id = ?`).run(id);
  revalidatePath("/", "layout");
}

export async function toggleMateriaEstudado(id: number) {
  db.prepare(
    `UPDATE materias SET estudado = CASE estudado WHEN 1 THEN 0 ELSE 1 END WHERE id = ?`
  ).run(id);
  revalidatePath("/", "layout");
}
