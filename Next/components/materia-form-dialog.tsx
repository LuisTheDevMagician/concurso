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
import { LinksField } from "@/components/links-field";
import {
  createMateria,
  updateMateria,
  type MateriaFormState,
} from "@/lib/actions/materias";
import type { Materia } from "@/lib/types";

const initialState: MateriaFormState = {};

export function MateriaFormDialog({
  disciplinaId,
  materia,
  open,
  onOpenChange,
  trigger,
}: {
  disciplinaId: number;
  materia?: Materia;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactElement;
}) {
  const action = materia
    ? updateMateria.bind(null, materia.id)
    : createMateria.bind(null, disciplinaId);
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
              {materia ? "Editar matéria" : "Nova matéria"}
            </DialogTitle>
            <DialogDescription>Dê um nome para a matéria.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field aria-invalid={state.error ? true : undefined}>
              <FieldLabel htmlFor="nome">Nome</FieldLabel>
              <Input
                id="nome"
                name="nome"
                defaultValue={materia?.nome}
                maxLength={100}
                required
              />
              {state.error ? <FieldError>{state.error}</FieldError> : null}
            </Field>
            <LinksField links={materia?.links ?? []} open={open} />
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {materia ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
