"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DIAS_SEMANA } from "@/lib/utils";

export function DiasSemanaToggle({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <ToggleGroup
      multiple
      variant="outline"
      size="sm"
      value={value}
      onValueChange={onChange}
      className="flex-wrap"
    >
      {DIAS_SEMANA.map((dia) => (
        <ToggleGroupItem
          key={dia.value}
          value={dia.value}
          className="aria-pressed:border-primary/50 aria-pressed:bg-primary/20 aria-pressed:text-primary aria-pressed:hover:bg-primary/30"
        >
          {dia.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
