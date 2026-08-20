"use client";

import { memo, useState } from "react";
import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { EntityLinksButton } from "@/components/entity-links-button";
import { EntityMenu } from "@/components/entity-menu";
import { MateriaCheckbox } from "@/components/materia-checkbox";
import { MateriaFormDialog } from "@/components/materia-form-dialog";
import { deleteMateria } from "@/lib/actions/materias";
import { cn } from "@/lib/utils";
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
    <div className="group/row flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: cor }}
      />
      <MateriaCheckbox materiaId={materia.id} estudado={materia.estudado} />
      <span
        className={cn(
          "flex-1 break-words text-sm",
          materia.estudado
            ? "text-muted-foreground line-through decoration-primary/50"
            : "text-foreground"
        )}
      >
        {materia.nome}
      </span>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100">
        <EntityLinksButton links={materia.links} />
        <EntityMenu
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
      </div>

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
    </div>
  );
});
