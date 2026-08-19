"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConcursoFormDialog } from "@/components/concurso-form-dialog";

export function NewConcursoButton() {
  const [open, setOpen] = useState(false);
  return (
    <ConcursoFormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button>
          <PlusIcon data-icon="inline-start" />
          Novo concurso
        </Button>
      }
    />
  );
}
