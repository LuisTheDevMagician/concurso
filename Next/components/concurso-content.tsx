"use client";

import { useState } from "react";
import { AddRevisaoModal } from "@/components/add-revisao-modal";
import { CalendarioMes } from "@/components/calendario-mes";
import { CalendarioRevisoes } from "@/components/calendario-revisoes";
import { RevisaoDayModal } from "@/components/revisao-day-modal";
import { DisciplinaCard } from "@/components/disciplina-card";
import { NewDisciplinaButton } from "@/components/new-disciplina-button";
import { Separator } from "@/components/ui/separator";
import type {
  Concurso,
  Disciplina,
  Materia,
  WithProgress,
  RevisaoComMateria,
} from "@/lib/types";
import { parseDiasSemana } from "@/lib/utils";

type MateriaComDisciplina = Materia & {
  disciplina_nome: string;
  disciplina_cor: string;
};

export function ConcursoContent({
  concurso,
  disciplinas,
  comDia,
  materias,
  revisoes,
  ano,
  mes,
}: {
  concurso: Concurso;
  disciplinas: (Disciplina & WithProgress)[];
  comDia: (Disciplina & WithProgress)[];
  materias: MateriaComDisciplina[];
  revisoes: RevisaoComMateria[];
  ano: number;
  mes: number;
}) {
  const [dayModal, setDayModal] = useState<{
    dia: number;
    revisoes: RevisaoComMateria[];
  } | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          {concurso.nome}
        </h1>
        <div className="flex items-center gap-2">
          <AddRevisaoModal materias={materias} concursoId={concurso.id} />
          <NewDisciplinaButton
            concursoId={concurso.id}
            concursoCor={concurso.cor}
          />
        </div>
      </div>

      {disciplinas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma disciplina cadastrada ainda.
        </p>
      ) : (
        <>
          <div className="stagger-children grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {disciplinas.map((disciplina) => (
              <DisciplinaCard
                key={disciplina.id}
                disciplina={disciplina}
                concursoId={concurso.id}
                concursoCor={concurso.cor}
              />
            ))}
          </div>

          {comDia.length > 0 ? (
            <>
              <Separator />
              <CalendarioMes
                disciplinas={comDia}
                ano={ano}
                mes={mes}
              />
            </>
          ) : null}

          <Separator />
          <CalendarioRevisoes
            revisoes={revisoes}
            ano={ano}
            mes={mes}
            onDiaClick={(dia, items) => setDayModal({ dia, revisoes: items })}
          />
        </>
      )}

      {dayModal ? (
        <RevisaoDayModal
          dia={dayModal.dia}
          revisoes={dayModal.revisoes}
          open={true}
          onOpenChange={(open) => {
            if (!open) setDayModal(null);
          }}
        />
      ) : null}
    </div>
  );
}
