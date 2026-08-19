"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ConcursoFormDialog } from "@/components/concurso-form-dialog";
import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { EntityMenu } from "@/components/entity-menu";
import { deleteConcurso } from "@/lib/actions/concursos";
import type { Concurso, WithProgress } from "@/lib/types";

export const ConcursoCard = memo(function ConcursoCard({
  concurso,
}: {
  concurso: Concurso & WithProgress;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <Card
      className="relative overflow-hidden border-t-2 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-18px_rgba(0,0,0,0.7)]"
      style={{ borderTopColor: concurso.cor }}
    >
      <Link
        href={`/concursos/${concurso.id}`}
        className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={concurso.nome}
      />
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-full transition-transform duration-200 group-hover/card:scale-125"
            style={{ backgroundColor: concurso.cor }}
          />
          <CardTitle className="truncate text-lg">{concurso.nome}</CardTitle>
        </div>
        <EntityMenu
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
      </CardHeader>

      {editOpen ? (
        <ConcursoFormDialog
          concurso={concurso}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Apagar "${concurso.nome}"?`}
        description="Isso vai apagar também todas as disciplinas e matérias desse concurso. Essa ação não pode ser desfeita."
        action={async () => {
          await deleteConcurso(concurso.id);
        }}
        onSuccess={() => setDeleteOpen(false)}
      />
    </Card>
  );
});
