"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Disciplina, WithProgress } from "@/lib/types";
import { parseDiasSemana } from "@/lib/utils";

const DIAS_HEADER = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function getDiasDoMes(ano: number, mes: number): number {
  return new Date(ano, mes + 1, 0).getDate();
}

function getDiaSemana(ano: number, mes: number, dia: number): number {
  const d = new Date(ano, mes, dia).getDay();
  return d === 0 ? 6 : d - 1;
}

export function CalendarioMes({
  disciplinas,
  ano: anoInicial,
  mes: mesInicial,
}: {
  disciplinas: (Disciplina & WithProgress)[];
  ano: number;
  mes: number;
}) {
  const [ano, setAno] = useState(anoInicial);
  const [mes, setMes] = useState(mesInicial);

  const voltar = () => {
    if (mes === 0) { setMes(11); setAno((a) => a - 1); }
    else setMes((m) => m - 1);
  };
  const avancar = () => {
    if (mes === 11) { setMes(0); setAno((a) => a + 1); }
    else setMes((m) => m + 1);
  };

  const totalDias = getDiasDoMes(ano, mes);
  const primeiroDia = getDiaSemana(ano, mes, 1);

  const disciplinasPorDia = new Map<number, (Disciplina & WithProgress)[]>();
  for (const d of disciplinas) {
    const dias = parseDiasSemana(d.dias_semana);
    if (dias.length === 0) continue;
    for (let dia = 1; dia <= totalDias; dia++) {
      const diaSemana = getDiaSemana(ano, mes, dia);
      if (dias.includes(String(diaSemana))) {
        const list = disciplinasPorDia.get(dia) ?? [];
        list.push(d);
        disciplinasPorDia.set(dia, list);
      }
    }
  }

  const celulas: (number | null)[] = [];
  for (let i = 0; i < primeiroDia; i++) celulas.push(null);
  for (let d = 1; d <= totalDias; d++) celulas.push(d);

  const hoje = new Date();
  const ehMesAtual = hoje.getFullYear() === ano && hoje.getMonth() === mes;
  const diaHoje = hoje.getDate();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Estudos
        </h2>
        <div className="flex items-center gap-1 ml-auto">
          <Button variant="ghost" size="icon" className="size-7" onClick={voltar}>
            <ChevronLeftIcon />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {MESES[mes]} {ano}
          </span>
          <Button variant="ghost" size="icon" className="size-7" onClick={avancar}>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px rounded-lg border bg-border overflow-hidden">
        {DIAS_HEADER.map((d) => (
          <div
            key={d}
            className="bg-muted px-2 py-1.5 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {celulas.map((dia, i) => {
          if (dia === null) {
            return <div key={`empty-${i}`} className="bg-background min-h-16" />;
          }
          const items = disciplinasPorDia.get(dia) ?? [];
          const ehHoje = ehMesAtual && dia === diaHoje;

          return (
            <div
              key={dia}
              className={`bg-background min-h-16 px-1 py-1 ${
                ehHoje ? "ring-2 ring-inset ring-yellow-400/60" : ""
              }`}
            >
              <span
                className={`block text-right text-xs font-medium px-1 ${
                  ehHoje
                    ? "text-yellow-400 font-bold"
                    : items.length > 0
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {dia}
              </span>
              <div className="flex flex-col gap-0.5 mt-0.5">
                {items.map((d) => (
                  <span
                    key={d.id}
                    className="block truncate rounded px-1 py-px text-[10px] font-medium leading-tight text-white"
                    style={{ backgroundColor: d.cor }}
                    title={d.nome}
                  >
                    {d.nome}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
