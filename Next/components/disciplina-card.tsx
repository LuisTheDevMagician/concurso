"use client";

import { memo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { DisciplinaFormDialog } from "@/components/disciplina-form-dialog";
import { EntityMenu } from "@/components/entity-menu";
import { deleteDisciplina } from "@/lib/actions/disciplinas";
import type { Disciplina, WithProgress } from "@/lib/types";

export const DisciplinaCard = memo(function DisciplinaCard({
  disciplina,
  concursoId,
  cor,
}: {
  disciplina: Disciplina & WithProgress;
  concursoId: number;
  cor: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <Card
      className="relative overflow-hidden border-l-4"
      style={{ borderLeftColor: cor }}
    >
      <Link
        href={`/concursos/${concursoId}/disciplinas/${disciplina.id}`}
        className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`${disciplina.nome}, ${disciplina.estudadas}/${disciplina.total} matérias estudadas`}
      />
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>{disciplina.nome}</CardTitle>
          <CardDescription>
            {disciplina.estudadas}/{disciplina.total} matérias estudadas
          </CardDescription>
        </div>
        <EntityMenu
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
      </CardHeader>

      {editOpen ? (
        <DisciplinaFormDialog
          concursoId={concursoId}
          disciplina={disciplina}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Apagar "${disciplina.nome}"?`}
        description="Isso vai apagar também todas as matérias dessa disciplina. Essa ação não pode ser desfeita."
        action={async () => {
          await deleteDisciplina(disciplina.id);
        }}
        onSuccess={() => setDeleteOpen(false)}
      />
    </Card>
  );
});
