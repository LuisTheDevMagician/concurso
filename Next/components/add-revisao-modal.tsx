"use client";

import { useState } from "react";
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
    return d.toISOString().split("T")[0];
  });
  const [pending, setPending] = useState(false);

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
      await createRevisoes(Array.from(selected), dataBase);
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
            <FieldLabel htmlFor="data-revisao">Data base</FieldLabel>
            <Input
              id="data-revisao"
              type="date"
              value={dataBase}
              onChange={(e) => setDataBase(e.target.value)}
            />
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
            disabled={pending || selected.size === 0}
          >
            {pending ? "Criando..." : `Criar ${selected.size * 4} revisões`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
