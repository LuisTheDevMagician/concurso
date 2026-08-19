"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DisciplinaFormDialog } from "@/components/disciplina-form-dialog";

export function NewDisciplinaButton({
  concursoId,
  concursoCor,
}: {
  concursoId: number;
  concursoCor: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <DisciplinaFormDialog
      concursoId={concursoId}
      concursoCor={concursoCor}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button>
          <PlusIcon data-icon="inline-start" />
          Nova disciplina
        </Button>
      }
    />
  );
}
