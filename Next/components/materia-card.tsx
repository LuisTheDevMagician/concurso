"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { EntityMenu } from "@/components/entity-menu";
import { MateriaCheckbox } from "@/components/materia-checkbox";
import { MateriaFormDialog } from "@/components/materia-form-dialog";
import { deleteMateria } from "@/lib/actions/materias";
import type { Materia } from "@/lib/types";

export function MateriaCard({
  materia,
  disciplinaId,
  cor,
}: {
  materia: Materia;
  disciplinaId: number;
  cor: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const estudado = materia.estudado === 1;

  return (
    <Card
      className="flex flex-row items-center justify-between gap-2 border-l-4 px-4 py-3"
      style={{ borderLeftColor: cor }}
    >
      <div className="flex items-center gap-3">
        <MateriaCheckbox materiaId={materia.id} estudado={estudado} />
        <CardTitle
          className={estudado ? "text-muted-foreground line-through" : undefined}
        >
          {materia.nome}
        </CardTitle>
      </div>
      <EntityMenu
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      <MateriaFormDialog
        disciplinaId={disciplinaId}
        materia={materia}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Apagar "${materia.nome}"?`}
        description="Essa ação não pode ser desfeita."
        action={deleteMateria.bind(null, materia.id)}
      />
    </Card>
  );
}
