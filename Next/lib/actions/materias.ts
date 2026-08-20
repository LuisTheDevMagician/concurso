"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { validateNome } from "@/lib/utils";

export type MateriaFormState = { error?: string };

const LINK_RE = /^https?:\/\//i;

function validateLinks(links: FormDataEntryValue[]) {
  const result: string[] = [];
  for (const link of links) {
    const linkStr = String(link).trim();
    if (!linkStr) continue;
    if (!LINK_RE.test(linkStr)) {
      return {
        error: "Link inválido. Deve começar com http:// ou https://.",
      } as const;
    }
    result.push(linkStr);
  }
  return { links: result } as const;
}

export async function createMateria(
  disciplinaId: number,
  _prevState: MateriaFormState,
  formData: FormData
): Promise<MateriaFormState> {
  const nomeResult = validateNome(formData.get("nome"));
  if ("error" in nomeResult) return nomeResult;
  const linksResult = validateLinks(formData.getAll("links"));
  if ("error" in linksResult) return linksResult;

  try {
    const parent = db
      .prepare(`SELECT id FROM disciplinas WHERE id = ?`)
      .get(disciplinaId);
    if (!parent) return { error: "Disciplina não encontrada." };

    db.prepare(
      `INSERT INTO materias (disciplina_id, nome, links) VALUES (?, ?, ?)`
    ).run(disciplinaId, nomeResult.nome, JSON.stringify(linksResult.links));
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
  const nomeResult = validateNome(formData.get("nome"));
  if ("error" in nomeResult) return nomeResult;
  const linksResult = validateLinks(formData.getAll("links"));
  if ("error" in linksResult) return linksResult;

  try {
    const { changes } = db
      .prepare(`UPDATE materias SET nome = ?, links = ? WHERE id = ?`)
      .run(nomeResult.nome, JSON.stringify(linksResult.links), id);
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
