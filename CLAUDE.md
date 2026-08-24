# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This repo's only project is a Next.js app under `Next/`. Most commands below must be run from `Next/`, not the repo root — the exception is `start.ts`.

`Next/CLAUDE.md` is a one-line `@AGENTS.md` import, so working inside `Next/` also pulls in `Next/AGENTS.md`. That file is auto-generated/rewritten by `next dev` on each run (it documents this version of Next.js differing from training data) — don't hand-edit it away permanently, and commit it if `next dev` regenerates it as part of your diff.

## Commands

From the repo root, `bun start.ts` is the one-shot entry point: it runs `bun install` only if `Next/node_modules` is missing, `bun run build` only if `Next/.next/BUILD_ID` is missing, then always runs `bun run start`. `Ctrl+C` kills the whole process tree. It has its own `tsconfig.json` at the repo root (separate from `Next/tsconfig.json`) and deliberately uses only Node built-ins (`node:child_process`, `node:fs`, etc.) rather than Bun-specific globals, so it type-checks using `Next/node_modules/@types` without needing its own dependency install.

Individual commands, run from `Next/`:

```
bun install       # install dependencies (package manager is bun, see packageManager field)
bun run dev        # start dev server
bun run build       # production build
bun run start       # run production build
bun run lint        # eslint -- CURRENTLY BROKEN, see below
```

**`bun run lint` does not run.** It dies before parsing a single file with `typescript-eslint does not support TS 7.0` — `eslint.config.mjs` pulls in `eslint-config-next/typescript`, whose typescript-eslint doesn't yet support the TypeScript 7 in `package.json`. This is a pre-existing dependency-version conflict, not something you broke; don't go debugging your own diff over it, and don't "fix" it by downgrading TypeScript unless the user asks.

**`bun run build` is therefore the real check** — it runs a full TypeScript pass ("Running TypeScript ..." in the output) and fails on type errors.

There is no test suite configured. For logic you need to prove out, write a throwaway script in a scratch directory and run it with `bun` — importing from `lib/` works, since `lib/utils.ts` and friends are plain TypeScript with no React. Don't add a test file to the repo unless the user asks for one.

Stack versions worth knowing before writing code: Next 16.3.1 (App Router, Turbopack), React 19.2.8, Tailwind CSS v4 (CSS-first config — no `tailwind.config`, everything is in `app/globals.css`), TypeScript 7, `better-sqlite3` 13.

## Architecture

**Concurso Tracker** — a Portuguese-language app for tracking study progress across Brazilian civil-service exam prep ("concursos"). Data model is a strict hierarchy:

```
Concurso (exam) → Disciplina (subject) → Matéria (topic) → Revisão (spaced-repetition review)
```

- `concursos`: name + accent color.
- `disciplinas`: belongs to a concurso; has a color, `dias_semana` (comma-separated weekday numbers, `0`=Sunday–`6`=Saturday) controlling which days it shows on the weekly view, and `links` (a JSON array of external study-material URLs).
- `materias`: belongs to a disciplina; a boolean `estudado` (studied) flag and its own `links` JSON array.
- `revisoes`: belongs to a materia; a spaced-repetition schedule. `createRevisoes` (`lib/actions/revisoes.ts`) generates 4 review dates per materia at fixed offsets `[0, 7, 15, 30]` days from a base date, inside a single `db.transaction`; `revisao_numero` (1–4, `CHECK`-constrained) records which offset a row came from and drives the "Hoje / 7 dias / 15 dias / 30 dias" labels in `revisao-day-modal.tsx`.

Routes mirror this hierarchy: `/` (concursos) → `/concursos/[concursoId]` (disciplinas + calendars) → `/concursos/[concursoId]/disciplinas/[disciplinaId]` (materias). Each level has a sibling `loading.tsx` with a hand-written skeleton.

### Data layer

- **NEVER delete, truncate, move, or overwrite `~/.local/share/concurso-tracker/concurso.db`** (or its `-wal`/`-shm` files) for any reason — not to "get a fresh DB" for testing, not to reset state, not as part of any troubleshooting step. It holds the user's real study-tracking data and there is no backup. If you need an empty database for a one-off test, copy the file elsewhere or point `HOME`/`USERPROFILE` at a scratch directory instead of touching the real one. If you think the DB is genuinely corrupt or needs to be reset, stop and ask the user first — do not act unilaterally.
- **SQLite via `better-sqlite3`**, opened synchronously in `lib/db.ts` with `foreign_keys = ON` (so every `ON DELETE CASCADE` in the schema actually fires). The DB file lives outside the repo at `~/.local/share/concurso-tracker/concurso.db`.
- **Schema changes** happen entirely in `lib/db.ts`, in two parts that must be kept in sync. First a `CREATE TABLE IF NOT EXISTS` block that defines the schema for a fresh DB. Then, below it, hand-rolled migrations for existing DBs: read `PRAGMA table_info(<table>)`, and if a column is missing, `ALTER TABLE ... ADD COLUMN` and backfill it. There are no migration files and no migration library — **adding a column means editing the `CREATE TABLE` statement *and* appending a `PRAGMA`-guarded `ALTER TABLE` + backfill**, or existing local DBs (including the user's real one) will break. The `links` columns are the reference example: they were added this way and backfilled from the older single-URL `link_material`/`link` columns.
- **Inspecting the DB safely**: open it with `{ readonly: true, fileMustExist: true }` so a stray query can never write. Note that **Bun crashes** on `better-sqlite3` under those options (`NAPI FATAL ERROR`, a Bun bug, not yours) — use `node` instead, importing via the absolute path `Next/node_modules/better-sqlite3/lib/index.js` so resolution works from outside the project.
- **Legacy columns**: `disciplinas.link_material` and `materias.link` still exist in the schema but are dead — nothing reads or writes them. `links` replaced both. Don't reintroduce them.
- **Reads**: `lib/queries.ts` — plain synchronous functions called directly from Server Components (no data-fetching hooks). Most queries join in progress counts (`total`/`estudadas`) via `LEFT JOIN materias` + `COUNT`/`SUM`. Any query returning disciplina or materia rows must map them through the local `parseLinks` helper, which `JSON.parse`s the `links` column into `string[]` — the `Disciplina`/`Materia` types in `lib/types.ts` declare `links: string[]`, so a query that skips `parseLinks` type-checks fine but hands the UI a raw JSON string. `getMaterias` additionally converts SQLite's integer `estudado` to a boolean.
- **Writes**: `lib/actions/*.ts` — one file per entity (`concursos`, `disciplinas`, `materias`, `revisoes`), all `"use server"` Server Actions. Create/update actions are built for `useActionState` (signature `(prevState, formData) => FormState`) and return `{ error?: string }`; delete/toggle actions take plain args and return `void`. Create actions verify the parent row exists before inserting; update actions treat `changes === 0` as "not found". Every mutation calls `revalidatePath("/", "layout")` rather than targeted revalidation. Links are written with `JSON.stringify` on the way in.
- Validation (hex color regex, non-empty name, weekday-list regex, `^https?://` link regex) happens inline in the action files, not via a schema library. `validateNome` is shared from `lib/utils.ts`; `validateLinks` is duplicated in `disciplinas.ts` and `materias.ts` and reads `formData.getAll("links")` (plural — the form renders one `<input name="links">` per row), dropping blanks and rejecting the whole submission on the first malformed URL.

### Weekday numbering (a real trap)

Two different conventions coexist:

- **Stored** — raw `Date.getDay()` numbering, `0`=Sunday…`6`=Saturday. This is what `dias_semana` holds, what `DIAS_SEMANA` / `DIAS_SEMANA_FULL` / `getDiaAtual()` use, and what the `DIAS_RE` validation regex accepts. Use `getDiaSemanaArmazenado(ano, mes, dia)` to get it for a given date — **this is the only convention valid for comparing a date against the user's chosen days**.
- **Grid** — the calendars render Monday-first, `0`=Monday…`6`=Sunday, via `getDiaSemanaGrade(ano, mes, dia)`. Use it **only** to offset the leading blank cells before the 1st.

Both live in `lib/utils.ts` alongside the rest of the weekday logic. Never reintroduce a local copy in a calendar component: `calendario-concursos.tsx` and `calendario-mes.tsx` each had one that returned the grid index and was then used for the `dias_semana` comparison, which shifted every highlight one day forward — a disciplina set to Monday lit Tuesday, and Monday itself only lit when Sunday was selected.

### UI

- Server Components fetch data and pass it down; interactive pieces (modals, calendars, forms) are `"use client"` components in `components/`. `app/concursos/[concursoId]/page.tsx` is a thin server shell that hands everything to `concurso-content.tsx`, which owns the client-side state shared between the revisão calendar and its day modal.
- `components/ui/` is shadcn/ui output (style `base-nova`, base color `neutral`, base-ui primitives — **not** Radix; see `components.json`). Regenerate/add primitives with the `shadcn` CLI rather than hand-rolling. Note the base-ui idiom used throughout: composition happens via a `render={<SomeElement />}` prop (e.g. `DialogTrigger`, `DropdownMenuTrigger`, `Button ... nativeButton={false}`), not Radix's `asChild`.
- Entity CRUD follows a repeated pattern per type (concurso/disciplina/materia): a `*-form-dialog.tsx` (create+edit modal driven by `useActionState`, closing itself via a `wasPending` ref once a submission finishes without an error), a `new-*-button.tsx` (opens the dialog in create mode), a `*-card.tsx` (list item, `memo`ized, opens the dialog in edit mode via `entity-menu.tsx`), and a shared `delete-alert-dialog.tsx` confirmation. Follow this pattern when adding a new entity type or field.
- Shared across entities: `entity-menu.tsx` (⋮ edit/delete dropdown), `entity-links-button.tsx` (renders nothing for 0 links, a direct `<a>` for 1, a dropdown for many), `links-field.tsx` (the repeatable link rows in the form dialogs — it re-seeds its rows from props whenever `open` flips true, since the dialog is not unmounted between edits).
- `concurso-card.tsx` and `disciplina-card.tsx` make the whole surface navigate with an absolutely-positioned `<Link className="absolute inset-0 z-0">`; interactive controls layered on top need `className="relative z-10"` plus `onClick={(e) => e.stopPropagation()}` or they get swallowed by the link. `materia-card.tsx` is the exception — it's a row with a checkbox and navigates nowhere, so it has no overlay link.
- There are three near-identical monthly calendars — `calendario-concursos.tsx` (home: which concursos have study days), `calendario-mes.tsx` (per-concurso: which disciplinas), `calendario-revisoes.tsx` (per-concurso: scheduled revisões, with a clickable day that opens `revisao-day-modal.tsx`). Each still duplicates its own `MESES`, `DIAS_HEADER`, and `getDiasDoMes` and keeps `ano`/`mes` in local `useState`, so a change to calendar behavior usually needs to be made in all three. Weekday logic is the exception — it is shared from `lib/utils.ts` (see above).
- `app/layout.tsx` forces dark mode (`className="dark"` on `<html>`) — there is no light-mode toggle. What *is* switchable is the color theme (see Themes below). Fonts are wired there too: Fraunces (`font-heading`, used for page titles), IBM Plex Sans (`font-sans`), IBM Plex Mono (`font-mono`, used for the numeric/label chrome).
- `app/globals.css` also holds the `.stagger-children` entry animation (a per-`nth-child` delay ladder applied to card grids, with a `prefers-reduced-motion` opt-out).

### Themes

Visual theming lives in `lib/themes/` and is a separate concept from dark/light mode — every theme is dark, they differ in full color identity (and, optionally, extra CSS effects).

- `lib/themes/types.ts` — the `ThemeTokens` interface (every CSS custom property a theme must define: `background`, `foreground`, `card`/`cardForeground`, `popover`/`popoverForeground`, `primary`/`primaryForeground`, `secondary`/`secondaryForeground`, `muted`/`mutedForeground`, `accent`/`accentForeground`, `destructive`, `border`, `input`, `ring`, `chart1`–`chart5`, and the `sidebar*` set) and the `Theme` interface (`id`, `label`, `description`, `tokens`).
- One file per theme (`petroleo.ts`, `crystal-green.ts`, `cyberpunk.ts`) exporting a single `Theme` object. Token values can be plain hex (`"#23643D"`) or `rgba(...)` strings for translucent surfaces — both are valid since tokens are just CSS custom property values, not typed colors.
- `lib/themes/index.ts` aggregates every theme into the `THEMES` array, exposes `DEFAULT_THEME_ID`, `THEME_COOKIE` (`"theme-id"`), `getTheme(id)` (falls back to the default when the id is unknown, e.g. a stale cookie after a theme was deleted), and `themeToCssVars(tokens)` (maps `ThemeTokens` keys to their `--css-variable` names via the explicit `CSS_VAR_MAP` — a new token needs an entry there too).

**To add a new theme:** create `lib/themes/<id>.ts` exporting a `Theme` with every `ThemeTokens` field filled in, then add it to the `THEMES` array in `lib/themes/index.ts`. That's the whole wiring — it appears in the floating theme-switcher (`components/theme-switcher.tsx`) automatically, with no other code changes needed. `petroleo.ts` is the simplest reference (flat hex colors, no extra CSS); `crystal-green.ts` and `cyberpunk.ts` show translucent tokens paired with a signature effect.

**Applying the theme:** `app/layout.tsx` reads the `theme-id` cookie server-side, resolves it via `getTheme`, and applies `themeToCssVars(theme.tokens)` as an inline `style` on `<html>` (avoids a flash of the wrong theme on load) plus a `data-theme={theme.id}` attribute. `ThemeSwitcher` does the same on the client when you pick a theme — it writes the CSS custom properties directly via `document.documentElement.style`, sets `data-theme`, and persists the choice in the `theme-id` cookie (not the database — this is a per-browser preference, not app data). The `:root` / `.dark` blocks in `globals.css` are only the pre-hydration baseline; the active theme always wins via the inline style.

**Optional signature CSS:** a theme isn't limited to flat token colors. Anything scoped to `[data-theme="<id>"]` in `app/globals.css` only applies when that theme is active — e.g. `crystal-green` adds `backdrop-filter` blur + a gradient-border mask on `.bg-card`/`.bg-popover` for the frosted-glass look, and background radial gradients on `body` for the blur to have something to catch; `cyberpunk` adds a neon `box-shadow` glow, a magenta/cyan gradient border, and a scanline background instead. This is entirely optional — a theme with no matching `[data-theme="..."]` block (like `petroleo`) is still fully valid, just flatter.

### Path aliases

`@/*` maps to `Next/*` (see `Next/tsconfig.json` / `components.json`) — this only applies within the Next app. The root-level `tsconfig.json` is unrelated; it's a separate, minimal project just for `start.ts`. Import app code as `@/lib/...`, `@/components/...`, etc.

### Notes

- All UI copy and domain vocabulary (concurso, disciplina, matéria, revisão) is in Portuguese; keep new UI text and identifiers consistent with this. Code comments and log output in `start.ts` are Portuguese too.
