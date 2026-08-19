"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleMateriaEstudado } from "@/lib/actions/materias";

export function MateriaCheckbox({
  materiaId,
  estudado,
}: {
  materiaId: number;
  estudado: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Checkbox
      checked={estudado}
      disabled={isPending}
      onCheckedChange={() => {
        startTransition(async () => {
          await toggleMateriaEstudado(materiaId);
        });
      }}
      aria-label={
        estudado ? "Marcar como não estudada" : "Marcar como estudada"
      }
    />
  );
}
