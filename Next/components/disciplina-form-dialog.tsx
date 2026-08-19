"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DiasSemanaToggle } from "@/components/dias-semana-toggle";
import {
  createDisciplina,
  updateDisciplina,
  type DisciplinaFormState,
} from "@/lib/actions/disciplinas";
import { parseDiasSemana } from "@/lib/utils";
import type { Disciplina } from "@/lib/types";

const initialState: DisciplinaFormState = {};

export function DisciplinaFormDialog({
  concursoId,
  concursoCor,
  disciplina,
  open,
  onOpenChange,
  trigger,
}: {
  concursoId: number;
  concursoCor: string;
  disciplina?: Disciplina;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactElement;
}) {
  const action = disciplina
    ? updateDisciplina.bind(null, disciplina.id)
    : createDisciplina.bind(null, concursoId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const wasPending = useRef(false);

  const [dias, setDias] = useState<string[]>(() =>
    parseDiasSemana(disciplina?.dias_semana ?? "")
  );

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      handleClose();
    }
    wasPending.current = pending;
  }, [pending, state, handleClose]);

  useEffect(() => {
    if (open) {
      setDias(parseDiasSemana(disciplina?.dias_semana ?? ""));
    }
  }, [open, disciplina]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent>
        <form action={formAction}>
          <input type="hidden" name="dias_semana" value={dias.join(",")} />
          <DialogHeader>
            <DialogTitle>
              {disciplina ? "Editar disciplina" : "Nova disciplina"}
            </DialogTitle>
            <DialogDescription>
              Dê um nome, escolha uma cor e defina os dias de estudo.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field aria-invalid={state.error ? true : undefined}>
              <FieldLabel htmlFor="nome">Nome</FieldLabel>
              <Input
                id="nome"
                name="nome"
                defaultValue={disciplina?.nome}
                maxLength={100}
                required
              />
              {state.error ? <FieldError>{state.error}</FieldError> : null}
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="cor">Cor</FieldLabel>
              <Input
                id="cor"
                name="cor"
                type="color"
                defaultValue={disciplina?.cor ?? concursoCor}
                className="h-10 w-16 p-1"
              />
            </Field>
            <Field>
              <FieldLabel>Dias de estudo</FieldLabel>
              <DiasSemanaToggle value={dias} onChange={setDias} />
              <FieldDescription>
                Selecione os dias da semana em que pretende estudar esta disciplina.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="link_material">
                Link do material online
              </FieldLabel>
              <Input
                id="link_material"
                name="link_material"
                type="url"
                placeholder="https://..."
                defaultValue={disciplina?.link_material ?? ""}
              />
              <FieldDescription>Opcional.</FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {disciplina ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
