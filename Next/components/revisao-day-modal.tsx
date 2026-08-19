"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteRevisao } from "@/lib/actions/revisoes";
import type { RevisaoComMateria } from "@/lib/types";

const NUM_LABELS: Record<number, string> = {
  1: "Hoje",
  2: "7 dias",
  3: "15 dias",
  4: "30 dias",
};

export function RevisaoDayModal({
  dia,
  revisoes,
  open,
  onOpenChange,
}: {
  dia: number;
  revisoes: RevisaoComMateria[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleDelete = async (id: number) => {
    await deleteRevisao(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revisões do dia {dia}</DialogTitle>
          <DialogDescription>
            {revisoes.length} {revisoes.length === 1 ? "revisão agendada" : "revisões agendadas"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          {revisoes.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: r.disciplina_cor }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{r.materia_nome}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.disciplina_nome} — {NUM_LABELS[r.revisao_numero] ?? `Revisão ${r.revisao_numero}`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
