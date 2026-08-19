"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type DisciplinaFormState = { error?: string };

function validateNome(nome: FormDataEntryValue | null) {
  const nomeStr = String(nome ?? "").trim();
  if (!nomeStr) return { error: "Nome não pode ser vazio." } as const;
  return { nome: nomeStr } as const;
}

export async function createDisciplina(
  concursoId: number,
  _prevState: DisciplinaFormState,
  formData: FormData
): Promise<DisciplinaFormState> {
  const result = validateNome(formData.get("nome"));
  if ("error" in result) return result;

  db.prepare(`INSERT INTO disciplinas (concurso_id, nome) VALUES (?, ?)`).run(
    concursoId,
    result.nome
  );
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

  db.prepare(`UPDATE disciplinas SET nome = ? WHERE id = ?`).run(
    result.nome,
    id
  );
  revalidatePath("/", "layout");
  return {};
}

export async function deleteDisciplina(id: number) {
  db.prepare(`DELETE FROM disciplinas WHERE id = ?`).run(id);
  revalidatePath("/", "layout");
}
