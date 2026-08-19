"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MateriaFormDialog } from "@/components/materia-form-dialog";

export function NewMateriaButton({ disciplinaId }: { disciplinaId: number }) {
  const [open, setOpen] = useState(false);
  return (
    <MateriaFormDialog
      disciplinaId={disciplinaId}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button>
          <PlusIcon data-icon="inline-start" />
          Nova matéria
        </Button>
      }
    />
  );
}
