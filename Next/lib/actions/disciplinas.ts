"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { validateNome } from "@/lib/utils";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const DIAS_RE = /^[0-6](,[0-6])*$/;

export type DisciplinaFormState = { error?: string };

function validateCor(cor: FormDataEntryValue | null) {
  const corStr = String(cor ?? "").trim();
  if (!HEX_RE.test(corStr)) return { error: "Cor inválida." } as const;
  return { cor: corStr } as const;
}

function validateDias(dias: FormDataEntryValue | null) {
  const diasStr = String(dias ?? "").trim();
  if (diasStr && !DIAS_RE.test(diasStr)) {
    return { error: "Dias da semana inválidos." } as const;
  }
  return { dias: diasStr } as const;
}

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

export async function createDisciplina(
  concursoId: number,
  _prevState: DisciplinaFormState,
  formData: FormData
): Promise<DisciplinaFormState> {
  const nomeResult = validateNome(formData.get("nome"));
  if ("error" in nomeResult) return nomeResult;
  const corResult = validateCor(formData.get("cor"));
  if ("error" in corResult) return corResult;
  const diasResult = validateDias(formData.get("dias_semana"));
  if ("error" in diasResult) return diasResult;
  const linksResult = validateLinks(formData.getAll("links"));
  if ("error" in linksResult) return linksResult;

  try {
    const parent = db
      .prepare(`SELECT id FROM concursos WHERE id = ?`)
      .get(concursoId);
    if (!parent) return { error: "Concurso não encontrado." };

    db.prepare(
      `INSERT INTO disciplinas (concurso_id, nome, cor, dias_semana, links) VALUES (?, ?, ?, ?, ?)`
    ).run(
      concursoId,
      nomeResult.nome,
      corResult.cor,
      diasResult.dias,
      JSON.stringify(linksResult.links)
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
  const nomeResult = validateNome(formData.get("nome"));
  if ("error" in nomeResult) return nomeResult;
  const corResult = validateCor(formData.get("cor"));
  if ("error" in corResult) return corResult;
  const diasResult = validateDias(formData.get("dias_semana"));
  if ("error" in diasResult) return diasResult;
  const linksResult = validateLinks(formData.getAll("links"));
  if ("error" in linksResult) return linksResult;

  try {
    const { changes } = db
      .prepare(
        `UPDATE disciplinas SET nome = ?, cor = ?, dias_semana = ?, links = ? WHERE id = ?`
      )
      .run(
        nomeResult.nome,
        corResult.cor,
        diasResult.dias,
        JSON.stringify(linksResult.links),
        id
      );
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
