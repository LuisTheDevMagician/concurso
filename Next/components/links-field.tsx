"use client";

import { useEffect, useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

let nextRowId = 0;

function toRows(links: string[]) {
  return links.map((value) => ({ id: nextRowId++, value }));
}

export function LinksField({
  links,
  open,
}: {
  links: string[];
  open: boolean;
}) {
  const [rows, setRows] = useState(() => toRows(links));

  useEffect(() => {
    if (open) setRows(toRows(links));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Field>
      <FieldLabel>Links</FieldLabel>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <Input
              name="links"
              type="url"
              placeholder="https://..."
              defaultValue={row.value}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setRows((prev) => prev.filter((r) => r.id !== row.id))
              }
              aria-label="Remover link"
            >
              <XIcon />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => setRows((prev) => [...prev, { id: nextRowId++, value: "" }])}
      >
        <PlusIcon data-icon="inline-start" />
        Adicionar link
      </Button>
    </Field>
  );
}
