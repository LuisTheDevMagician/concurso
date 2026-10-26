"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createRevisoes } from "@/lib/actions/revisoes";
import type { Materia } from "@/lib/types";

type MateriaComDisciplina = Materia & {
  disciplina_nome: string;
  disciplina_cor: string;
};

export function AddRevisaoModal({
  materias,
  concursoId,
}: {
  materias: MateriaComDisciplina[];
  concursoId: number;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [dataBase, setDataBase] = useState(() => {
    const d = new Date();
    return {
      dia: String(d.getDate()).padStart(2, "0"),
      mes: String(d.getMonth() + 1).padStart(2, "0"),
      ano: String(d.getFullYear()),
    };
  });
  const [pending, setPending] = useState(false);

  const dataValida =
    /^\d{1,2}$/.test(dataBase.dia) &&
    /^\d{1,2}$/.test(dataBase.mes) &&
    /^\d{4}$/.test(dataBase.ano);
  const iso = dataValida
    ? `${dataBase.ano}-${dataBase.mes.padStart(2, "0")}-${dataBase.dia.padStart(2, "0")}`
    : "";
  const dataExiste = dataValida && !isNaN(new Date(iso).getTime());

  const setNumerico =
    (campo: "dia" | "mes" | "ano", maxLen: number) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const valor = e.target.value.replace(/\D/g, "").slice(0, maxLen);
      setDataBase((prev) => ({ ...prev, [campo]: valor }));
    };

  const datePickerRef = useRef<HTMLInputElement>(null);

  const handleCalendarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value; // "aaaa-mm-dd" ou ""
    if (!valor) return;
    const [ano, mes, dia] = valor.split("-");
    setDataBase({ dia, mes, ano });
  };

  const grouped = new Map<string, MateriaComDisciplina[]>();
  for (const m of materias) {
    const list = grouped.get(m.disciplina_nome) ?? [];
    list.push(m);
    grouped.set(m.disciplina_nome, list);
  }

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setPending(true);
    try {
      await createRevisoes(Array.from(selected), iso);
      setSelected(new Set());
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            + Revisão
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar revisão</DialogTitle>
          <DialogDescription>
            Selecione as matérias para revisar. Serão criadas 4 revisões
            espacadas: hoje, 7, 15 e 30 dias.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="py-2 max-h-80 overflow-y-auto">
          <Field>
            <FieldLabel htmlFor="data-revisao-dia">Data base</FieldLabel>
            <div className="flex items-center gap-1.5">
              <Input
                id="data-revisao-dia"
                inputMode="numeric"
                placeholder="dd"
                aria-label="Dia"
                value={dataBase.dia}
                onChange={setNumerico("dia", 2)}
                className="w-16 text-center"
              />
              <span className="text-muted-foreground select-none">/</span>
              <Input
                inputMode="numeric"
                placeholder="mm"
                aria-label="Mês"
                value={dataBase.mes}
                onChange={setNumerico("mes", 2)}
                className="w-16 text-center"
              />
              <span className="text-muted-foreground select-none">/</span>
              <Input
                inputMode="numeric"
                placeholder="aaaa"
                aria-label="Ano"
                value={dataBase.ano}
                onChange={setNumerico("ano", 4)}
                className="w-20 text-center"
              />
              <span
                className="relative size-8 shrink-0 grid place-items-center rounded-lg border border-input bg-transparent"
                title="Selecionar no calendário"
              >
                <CalendarIcon className="size-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={datePickerRef}
                  type="date"
                  value={dataExiste ? iso : ""}
                  onChange={handleCalendarChange}
                  aria-label="Selecionar data no calendário"
                  onClick={() => {
                    try {
                      datePickerRef.current?.showPicker();
                    } catch {
                      /* navegadores sem showPicker abrem no clique do ícone nativo */
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </span>
            </div>
          </Field>
          {Array.from(grouped.entries()).map(([discNome, items]) => (
            <div key={discNome} className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {discNome}
              </p>
              {items.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selected.has(m.id)}
                    onCheckedChange={() => toggle(m.id)}
                  />
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: m.disciplina_cor }}
                  />
                  {m.nome}
                </label>
              ))}
            </div>
          ))}
        </FieldGroup>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={pending || selected.size === 0 || !dataExiste}
          >
            {pending
              ? "Criando..."
              : dataExiste && selected.size > 0
                ? `Criar ${selected.size * 4} revisões`
                : "Criar revisões"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
