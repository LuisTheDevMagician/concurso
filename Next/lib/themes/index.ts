import type { Theme, ThemeTokens } from "./types";
import { petroleoTheme } from "./petroleo";
import { crystalGreenTheme } from "./crystal-green";
import { cyberpunkTheme } from "./cyberpunk";

export type { Theme, ThemeTokens };

export const THEMES: Theme[] = [petroleoTheme, crystalGreenTheme, cyberpunkTheme];

export const DEFAULT_THEME_ID = petroleoTheme.id;

export const THEME_COOKIE = "theme-id";

export function getTheme(id: string | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? petroleoTheme;
}

const CSS_VAR_MAP: Record<keyof ThemeTokens, string> = {
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  destructive: "--destructive",
  border: "--border",
  input: "--input",
  ring: "--ring",
  chart1: "--chart-1",
  chart2: "--chart-2",
  chart3: "--chart-3",
  chart4: "--chart-4",
  chart5: "--chart-5",
  sidebar: "--sidebar",
  sidebarForeground: "--sidebar-foreground",
  sidebarPrimary: "--sidebar-primary",
  sidebarPrimaryForeground: "--sidebar-primary-foreground",
  sidebarAccent: "--sidebar-accent",
  sidebarAccentForeground: "--sidebar-accent-foreground",
  sidebarBorder: "--sidebar-border",
  sidebarRing: "--sidebar-ring",
};

export function themeToCssVars(tokens: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const key of Object.keys(tokens) as (keyof ThemeTokens)[]) {
    vars[CSS_VAR_MAP[key]] = tokens[key];
  }
  return vars;
}
