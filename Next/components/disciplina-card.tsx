"use client";

import { memo, useState } from "react";
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
import { formatDiasSemana, parseDiasSemana } from "@/lib/utils";
import type { Disciplina, WithProgress } from "@/lib/types";

export const DisciplinaCard = memo(function DisciplinaCard({
  disciplina,
  concursoId,
  concursoCor,
}: {
  disciplina: Disciplina & WithProgress;
  concursoId: number;
  concursoCor: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <Card
      className="relative overflow-hidden border-l-4"
      style={{ borderLeftColor: disciplina.cor }}
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
          {parseDiasSemana(disciplina.dias_semana).length > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDiasSemana(disciplina.dias_semana)}
            </p>
          ) : null}
        </div>
        <EntityMenu
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
      </CardHeader>

      {editOpen ? (
        <DisciplinaFormDialog
          concursoId={concursoId}
          concursoCor={concursoCor}
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
