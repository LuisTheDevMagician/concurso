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
  createConcurso,
  updateConcurso,
  type ConcursoFormState,
} from "@/lib/actions/concursos";
import type { Concurso } from "@/lib/types";

const initialState: ConcursoFormState = {};

export function ConcursoFormDialog({
  concurso,
  open,
  onOpenChange,
  trigger,
}: {
  concurso?: Concurso;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactElement;
}) {
  const action = concurso
    ? updateConcurso.bind(null, concurso.id)
    : createConcurso;
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
              {concurso ? "Editar concurso" : "Novo concurso"}
            </DialogTitle>
            <DialogDescription>
              Dê um nome e escolha uma cor para identificar esse concurso.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field aria-invalid={state.error ? true : undefined}>
              <FieldLabel htmlFor="nome">Nome</FieldLabel>
              <Input
                id="nome"
                name="nome"
                defaultValue={concurso?.nome}
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
                defaultValue={concurso?.cor ?? "#6366f1"}
                className="h-10 w-16 p-1"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {concurso ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
