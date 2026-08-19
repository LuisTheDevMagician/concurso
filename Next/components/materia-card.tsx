"use client";

import { memo, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { EntityMenu } from "@/components/entity-menu";
import { MateriaCheckbox } from "@/components/materia-checkbox";
import { MateriaFormDialog } from "@/components/materia-form-dialog";
import { deleteMateria } from "@/lib/actions/materias";
import type { Materia } from "@/lib/types";

export const MateriaCard = memo(function MateriaCard({
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

  return (
    <Card
      className="flex flex-row items-center justify-between gap-2 border-l-4 px-4 py-3"
      style={{ borderLeftColor: cor }}
    >
      <div className="flex items-center gap-3">
        <MateriaCheckbox materiaId={materia.id} estudado={materia.estudado} />
        <CardTitle
          className={
            materia.estudado ? "text-muted-foreground line-through" : undefined
          }
        >
          {materia.nome}
        </CardTitle>
      </div>
      <EntityMenu
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      {editOpen ? (
        <MateriaFormDialog
          disciplinaId={disciplinaId}
          materia={materia}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Apagar "${materia.nome}"?`}
        description="Essa ação não pode ser desfeita."
        action={async () => {
          await deleteMateria(materia.id);
        }}
        onSuccess={() => setDeleteOpen(false)}
      />
    </Card>
  );
});
