"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { DisciplinaFormDialog } from "@/components/disciplina-form-dialog";
import { EntityLinksButton } from "@/components/entity-links-button";
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
      className="relative overflow-hidden border-t-2 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-18px_rgba(0,0,0,0.7)]"
      style={{ borderTopColor: disciplina.cor }}
    >
      <Link
        href={`/concursos/${concursoId}/disciplinas/${disciplina.id}`}
        className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`${disciplina.nome}, ${disciplina.estudadas}/${disciplina.total} matérias estudadas`}
      />
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full transition-transform duration-200 group-hover/card:scale-125"
              style={{ backgroundColor: disciplina.cor }}
            />
            <CardTitle className="truncate text-lg">{disciplina.nome}</CardTitle>
          </div>
          <div className="flex items-center gap-2 pl-5">
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {String(disciplina.estudadas).padStart(2, "0")}/
              {String(disciplina.total).padStart(2, "0")}
            </span>
            <span className="h-1 w-16 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-primary transition-[width] duration-500"
                style={{
                  width: `${disciplina.total ? (disciplina.estudadas / disciplina.total) * 100 : 0}%`,
                }}
              />
            </span>
          </div>
          {parseDiasSemana(disciplina.dias_semana).length > 0 ? (
            <p className="pl-5 text-xs text-muted-foreground">
              {formatDiasSemana(disciplina.dias_semana)}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <EntityLinksButton links={disciplina.links} />
          <EntityMenu
            onEdit={() => setEditOpen(true)}
            onDelete={() => setDeleteOpen(true)}
          />
        </div>
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
