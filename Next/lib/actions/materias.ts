"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { validateNome } from "@/lib/utils";

export type MateriaFormState = { error?: string };

export async function createMateria(
  disciplinaId: number,
  _prevState: MateriaFormState,
  formData: FormData
): Promise<MateriaFormState> {
  const result = validateNome(formData.get("nome"));
  if ("error" in result) return result;

  try {
    const parent = db
      .prepare(`SELECT id FROM disciplinas WHERE id = ?`)
      .get(disciplinaId);
    if (!parent) return { error: "Disciplina não encontrada." };

    db.prepare(`INSERT INTO materias (disciplina_id, nome) VALUES (?, ?)`).run(
      disciplinaId,
      result.nome
    );
  } catch {
    return { error: "Erro ao criar matéria." };
  }
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

  try {
    const { changes } = db
      .prepare(`UPDATE materias SET nome = ? WHERE id = ?`)
      .run(result.nome, id);
    if (changes === 0) return { error: "Matéria não encontrada." };
  } catch {
    return { error: "Erro ao salvar matéria." };
  }
  revalidatePath("/", "layout");
  return {};
}

export async function deleteMateria(id: number) {
  try {
    db.prepare(`DELETE FROM materias WHERE id = ?`).run(id);
  } catch {
    return;
  }
  revalidatePath("/", "layout");
}

export async function toggleMateriaEstudado(id: number) {
  try {
    db.prepare(
      `UPDATE materias SET estudado = CASE estudado WHEN 1 THEN 0 ELSE 1 END WHERE id = ?`
    ).run(id);
  } catch {
    return;
  }
  revalidatePath("/", "layout");
}
