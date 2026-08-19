"use client";

import { useEffect, useRef, useState } from "react";
import { PaletteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THEMES, THEME_COOKIE, themeToCssVars } from "@/lib/themes";

function applyTheme(themeId: string) {
  const theme = THEMES.find((t) => t.id === themeId);
  if (!theme) return;
  const vars = themeToCssVars(theme.tokens);
  const root = document.documentElement.style;
  for (const [key, value] of Object.entries(vars)) {
    root.setProperty(key, value);
  }
  document.documentElement.setAttribute("data-theme", theme.id);
}

export function ThemeSwitcher({ initial }: { initial: string }) {
  const [open, setOpen] = useState(false);
  const [themeId, setThemeId] = useState(initial);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function choose(id: string) {
    setThemeId(id);
    applyTheme(id);
    document.cookie = `${THEME_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=31536000; SameSite=Lax`;
  }

  return (
    <div ref={panelRef} className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="absolute bottom-14 right-0 flex w-64 flex-col gap-2 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
          <p className="px-2 pt-1 text-xs font-medium text-muted-foreground">
            Tema
          </p>
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => choose(theme.id)}
              className={`flex items-center gap-3 rounded-lg border px-2 py-2 text-left transition-colors hover:bg-muted/50 ${
                themeId === theme.id ? "border-primary" : "border-transparent"
              }`}
            >
              <span
                className="flex size-8 shrink-0 overflow-hidden rounded-full border border-foreground/10"
                aria-hidden
              >
                <span
                  className="h-full w-1/2"
                  style={{ backgroundColor: theme.tokens.background }}
                />
                <span
                  className="h-full w-1/2"
                  style={{ backgroundColor: theme.tokens.primary }}
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {theme.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {theme.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-label="Escolher tema"
      >
        <PaletteIcon />
      </Button>
    </div>
  );
}
