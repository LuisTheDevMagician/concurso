"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const OFFSETS = [0, 7, 15, 30];

export async function createRevisoes(
  materiaIds: number[],
  dataBase: string
) {
  if (!materiaIds.length || !dataBase) return;

  const baseDate = new Date(dataBase);
  if (isNaN(baseDate.getTime())) return;

  const insert = db.prepare(
    `INSERT INTO revisoes (materia_id, data, revisao_numero) VALUES (?, ?, ?)`
  );

  const tx = db.transaction(() => {
    for (const materiaId of materiaIds) {
      for (let i = 0; i < OFFSETS.length; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + OFFSETS[i]);
        const iso = d.toISOString().split("T")[0];
        insert.run(materiaId, iso, i + 1);
      }
    }
  });

  tx();
  revalidatePath("/", "layout");
}

export async function deleteRevisao(id: number) {
  try {
    db.prepare(`DELETE FROM revisoes WHERE id = ?`).run(id);
  } catch {
    return;
  }
  revalidatePath("/", "layout");
}
