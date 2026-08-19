"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { validateNome } from "@/lib/utils";

export type DisciplinaFormState = { error?: string };

export async function createDisciplina(
  concursoId: number,
  _prevState: DisciplinaFormState,
  formData: FormData
): Promise<DisciplinaFormState> {
  const result = validateNome(formData.get("nome"));
  if ("error" in result) return result;

  try {
    const parent = db
      .prepare(`SELECT id FROM concursos WHERE id = ?`)
      .get(concursoId);
    if (!parent) return { error: "Concurso não encontrado." };

    db.prepare(`INSERT INTO disciplinas (concurso_id, nome) VALUES (?, ?)`).run(
      concursoId,
      result.nome
    );
  } catch {
    return { error: "Erro ao criar disciplina." };
  }
  revalidatePath("/", "layout");
  return {};
}

export async function updateDisciplina(
  id: number,
  _prevState: DisciplinaFormState,
  formData: FormData
): Promise<DisciplinaFormState> {
  const result = validateNome(formData.get("nome"));
  if ("error" in result) return result;

  try {
    const { changes } = db
      .prepare(`UPDATE disciplinas SET nome = ? WHERE id = ?`)
      .run(result.nome, id);
    if (changes === 0) return { error: "Disciplina não encontrada." };
  } catch {
    return { error: "Erro ao salvar disciplina." };
  }
  revalidatePath("/", "layout");
  return {};
}

export async function deleteDisciplina(id: number) {
  try {
    db.prepare(`DELETE FROM disciplinas WHERE id = ?`).run(id);
  } catch {
    return;
  }
  revalidatePath("/", "layout");
}
