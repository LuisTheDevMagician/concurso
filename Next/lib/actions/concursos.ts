"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export type ConcursoFormState = { error?: string };

function validate(
  nome: FormDataEntryValue | null,
  cor: FormDataEntryValue | null
) {
  const nomeStr = String(nome ?? "").trim();
  const corStr = String(cor ?? "").trim();
  if (!nomeStr) return { error: "Nome não pode ser vazio." } as const;
  if (!HEX_RE.test(corStr)) return { error: "Cor inválida." } as const;
  return { nome: nomeStr, cor: corStr } as const;
}

export async function createConcurso(
  _prevState: ConcursoFormState,
  formData: FormData
): Promise<ConcursoFormState> {
  const result = validate(formData.get("nome"), formData.get("cor"));
  if ("error" in result) return result;

  try {
    db.prepare(`INSERT INTO concursos (nome, cor) VALUES (?, ?)`).run(
      result.nome,
      result.cor
    );
  } catch {
    return { error: "Erro ao criar concurso." };
  }
  revalidatePath("/", "layout");
  return {};
}

export async function updateConcurso(
  id: number,
  _prevState: ConcursoFormState,
  formData: FormData
): Promise<ConcursoFormState> {
  const result = validate(formData.get("nome"), formData.get("cor"));
  if ("error" in result) return result;

  try {
    const { changes } = db
      .prepare(`UPDATE concursos SET nome = ?, cor = ? WHERE id = ?`)
      .run(result.nome, result.cor, id);
    if (changes === 0) return { error: "Concurso não encontrado." };
  } catch {
    return { error: "Erro ao salvar concurso." };
  }
  revalidatePath("/", "layout");
  return {};
}

export async function deleteConcurso(id: number) {
  try {
    db.prepare(`DELETE FROM concursos WHERE id = ?`).run(id);
  } catch {
    return;
  }
  revalidatePath("/", "layout");
}
