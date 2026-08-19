# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This repo's only project is a Next.js app under `Next/`. Most commands below must be run from `Next/`, not the repo root — the exception is `start.ts`.

## Commands

From the repo root, `bun start.ts` is the one-shot entry point: it runs `bun install` only if `Next/node_modules` is missing, `bun run build` only if `Next/.next/BUILD_ID` is missing, then always runs `bun run start`. `Ctrl+C` kills the whole process tree. It has its own `tsconfig.json` at the repo root (separate from `Next/tsconfig.json`) and deliberately uses only Node built-ins (`node:child_process`, `node:fs`, etc.) rather than Bun-specific globals, so it type-checks using `Next/node_modules/@types` without needing its own dependency install.

Individual commands, run from `Next/`:

```
bun install       # install dependencies (package manager is bun, see packageManager field)
bun run dev        # start dev server
bun run build       # production build
bun run start       # run production build
bun run lint        # eslint
```

There is no test suite configured in this project.

## Architecture

**Concurso Tracker** — a Portuguese-language app for tracking study progress across Brazilian civil-service exam prep ("concursos"). Data model is a strict hierarchy:

```
Concurso (exam) → Disciplina (subject) → Matéria (topic) → Revisão (spaced-repetition review)
```

- `concursos`: name + accent color.
- `disciplinas`: belongs to a concurso; has a color, `dias_semana` (comma-separated weekday numbers, `0`=Sunday–`6`=Saturday) controlling which days it shows on the weekly view, and an optional `link_material` URL (external study material, opened in a new tab from the disciplina card).
- `materias`: belongs to a disciplina; a boolean `estudado` (studied) flag.
- `revisoes`: belongs to a materia; a spaced-repetition schedule. `createRevisoes` (`lib/actions/revisoes.ts`) generates 4 review dates per materia at fixed offsets `[0, 7, 15, 30]` days from a base date.

Routes mirror this hierarchy: `/` (concursos) → `/concursos/[concursoId]` (disciplinas + calendar) → `/concursos/[concursoId]/disciplinas/[disciplinaId]` (materias).

### Data layer

- **SQLite via `better-sqlite3`**, opened synchronously in `lib/db.ts`. The DB file lives outside the repo at `~/.local/share/concurso-tracker/concurso.db` and schema is created with `CREATE TABLE IF NOT EXISTS` on module load — there are no migration files; schema changes are made by editing the `CREATE TABLE` statements directly (existing local DBs won't pick up column changes automatically).
- **Reads**: `lib/queries.ts` — plain synchronous functions called directly from Server Components (no data-fetching hooks). Most queries join in progress counts (`total`/`estudadas`) via `LEFT JOIN materias` + `COUNT`/`SUM`.
- **Writes**: `lib/actions/*.ts` — one file per entity (`concursos`, `disciplinas`, `materias`, `revisoes`), all `"use server"` Server Actions. Create/update actions are built for `useActionState` (signature `(prevState, formData) => FormState`) and return `{ error?: string }`; delete/toggle actions take plain args and return `void`. Every mutation calls `revalidatePath("/", "layout")` rather than targeted revalidation.
- Validation (hex color regex, non-empty name, weekday-list regex) happens inline in the action files, not via a schema library. `validateNome` is shared from `lib/utils.ts`.

### UI

- Server Components fetch data and pass it down; interactive pieces (modals, calendars, forms) are `"use client"` components in `components/`.
- `components/ui/` is shadcn/ui output (style `base-nova`, base color `neutral`, base-ui primitives — **not** Radix; see `components.json`). Regenerate/add primitives with the `shadcn` CLI rather than hand-rolling.
- Entity CRUD follows a repeated pattern per type (concurso/disciplina/materia): a `*-form-dialog.tsx` (create+edit modal driven by `useActionState`), a `new-*-button.tsx` (opens the dialog in create mode), a `*-card.tsx` (list item, opens the dialog in edit mode via `entity-menu.tsx`), and a `delete-alert-dialog.tsx` confirmation. Follow this pattern when adding a new entity type or field.
- `app/layout.tsx` forces dark mode (`className="dark"` on `<html>`) — there is no light-mode toggle. What *is* switchable is the color theme (see Themes below).

### Themes

Visual theming lives in `lib/themes/` and is a separate concept from dark/light mode — every theme is dark, they differ in full color identity (and, optionally, extra CSS effects).

- `lib/themes/types.ts` — the `ThemeTokens` interface (every CSS custom property a theme must define: `background`, `foreground`, `card`/`cardForeground`, `popover`/`popoverForeground`, `primary`/`primaryForeground`, `secondary`/`secondaryForeground`, `muted`/`mutedForeground`, `accent`/`accentForeground`, `destructive`, `border`, `input`, `ring`, `chart1`–`chart5`, and the `sidebar*` set) and the `Theme` interface (`id`, `label`, `description`, `tokens`).
- One file per theme (`petroleo.ts`, `crystal-green.ts`, `cyberpunk.ts`) exporting a single `Theme` object. Token values can be plain hex (`"#23643D"`) or `rgba(...)` strings for translucent surfaces — both are valid since tokens are just CSS custom property values, not typed colors.
- `lib/themes/index.ts` aggregates every theme into the `THEMES` array, exposes `DEFAULT_THEME_ID`, `THEME_COOKIE` (`"theme-id"`), `getTheme(id)` (falls back to the default when the id is unknown, e.g. a stale cookie after a theme was deleted), and `themeToCssVars(tokens)` (maps `ThemeTokens` keys to their `--css-variable` names).

**To add a new theme:** create `lib/themes/<id>.ts` exporting a `Theme` with every `ThemeTokens` field filled in, then add it to the `THEMES` array in `lib/themes/index.ts`. That's the whole wiring — it appears in the floating theme-switcher (`components/theme-switcher.tsx`) automatically, with no other code changes needed. `petroleo.ts` is the simplest reference (flat hex colors, no extra CSS); `crystal-green.ts` and `cyberpunk.ts` show translucent tokens paired with a signature effect.

**Applying the theme:** `app/layout.tsx` reads the `theme-id` cookie server-side, resolves it via `getTheme`, and applies `themeToCssVars(theme.tokens)` as an inline `style` on `<html>` (avoids a flash of the wrong theme on load) plus a `data-theme={theme.id}` attribute. `ThemeSwitcher` does the same on the client when you pick a theme — it writes the CSS custom properties directly via `document.documentElement.style`, sets `data-theme`, and persists the choice in the `theme-id` cookie (not the database — this is a per-browser preference, not app data).

**Optional signature CSS:** a theme isn't limited to flat token colors. Anything scoped to `[data-theme="<id>"]` in `app/globals.css` only applies when that theme is active — e.g. `crystal-green` adds `backdrop-filter` blur + a gradient-border mask on `.bg-card`/`.bg-popover` for the frosted-glass look, and background radial gradients on `body` for the blur to have something to catch; `cyberpunk` adds a neon `box-shadow` glow, a magenta/cyan gradient border, and a scanline background instead. This is entirely optional — a theme with no matching `[data-theme="..."]` block (like `petroleo`) is still fully valid, just flatter.

### Path aliases

`@/*` maps to `Next/*` (see `Next/tsconfig.json` / `components.json`) — this only applies within the Next app. The root-level `tsconfig.json` is unrelated; it's a separate, minimal project just for `start.ts`. Import app code as `@/lib/...`, `@/components/...`, etc.

### Notes

- `Next/AGENTS.md` is auto-generated/rewritten by `next dev` on each run (documents this version of Next.js differing from training data) — don't hand-edit it away permanently, and commit it if `next dev` regenerates it as part of your diff.
- All UI copy and domain vocabulary (concurso, disciplina, matéria, revisão) is in Portuguese; keep new UI text and identifiers consistent with this.
