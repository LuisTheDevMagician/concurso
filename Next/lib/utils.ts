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
