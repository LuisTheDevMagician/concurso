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
          className="aria-pressed:border-yellow-500/50 aria-pressed:bg-yellow-500/20 aria-pressed:text-yellow-400 aria-pressed:hover:bg-yellow-500/30"
        >
          {dia.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
