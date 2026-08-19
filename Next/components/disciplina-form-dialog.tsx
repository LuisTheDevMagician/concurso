"use client";

import { useActionState, useCallback, useEffect, useRef } from "react";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createDisciplina,
  updateDisciplina,
  type DisciplinaFormState,
} from "@/lib/actions/disciplinas";
import type { Disciplina } from "@/lib/types";

const initialState: DisciplinaFormState = {};

export function DisciplinaFormDialog({
  concursoId,
  disciplina,
  open,
  onOpenChange,
  trigger,
}: {
  concursoId: number;
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

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      handleClose();
    }
    wasPending.current = pending;
  }, [pending, state, handleClose]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>
              {disciplina ? "Editar disciplina" : "Nova disciplina"}
            </DialogTitle>
            <DialogDescription>Dê um nome para a disciplina.</DialogDescription>
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
