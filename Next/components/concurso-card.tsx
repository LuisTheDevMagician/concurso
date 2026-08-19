"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConcursoFormDialog } from "@/components/concurso-form-dialog";
import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { EntityMenu } from "@/components/entity-menu";
import { deleteConcurso } from "@/lib/actions/concursos";
import type { Concurso, WithProgress } from "@/lib/types";

export function ConcursoCard({
  concurso,
}: {
  concurso: Concurso & WithProgress;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <Card
      className="relative overflow-hidden border-l-4"
      style={{ borderLeftColor: concurso.cor }}
    >
      <Link
        href={`/concursos/${concurso.id}`}
        className="absolute inset-0 z-0"
        aria-label={concurso.nome}
      />
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>{concurso.nome}</CardTitle>
          <CardDescription>
            {concurso.estudadas}/{concurso.total} matérias estudadas
          </CardDescription>
        </div>
        <EntityMenu
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
      </CardHeader>

      <ConcursoFormDialog
        concurso={concurso}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Apagar "${concurso.nome}"?`}
        description="Isso vai apagar também todas as disciplinas e matérias desse concurso. Essa ação não pode ser desfeita."
        action={deleteConcurso.bind(null, concurso.id)}
      />
    </Card>
  );
}
