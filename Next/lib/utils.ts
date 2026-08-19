import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateNome(nome: FormDataEntryValue | null) {
  const nomeStr = String(nome ?? "").trim();
  if (!nomeStr) return { error: "Nome não pode ser vazio." } as const;
  return { nome: nomeStr } as const;
}

export const DIAS_SEMANA = [
  { value: "1", label: "Seg" },
  { value: "2", label: "Ter" },
  { value: "3", label: "Qua" },
  { value: "4", label: "Qui" },
  { value: "5", label: "Sex" },
  { value: "6", label: "Sáb" },
  { value: "0", label: "Dom" },
] as const;

export const DIAS_SEMANA_FULL: Record<string, string> = {
  "0": "Domingo",
  "1": "Segunda-feira",
  "2": "Terça-feira",
  "3": "Quarta-feira",
  "4": "Quinta-feira",
  "5": "Sexta-feira",
  "6": "Sábado",
};

export function parseDiasSemana(dias: string): string[] {
  if (!dias) return [];
  return dias.split(",").filter(Boolean);
}

export function formatDiasSemana(dias: string): string {
  const parsed = parseDiasSemana(dias);
  if (parsed.length === 0) return "Nenhum dia definido";
  if (parsed.length === 7) return "Todos os dias";
  return parsed
    .sort((a, b) => Number(a) - Number(b))
    .map((d) => DIAS_SEMANA_FULL[d] ?? d)
    .join(", ");
}

export function getDiaAtual(): string {
  return String(new Date().getDay());
}
