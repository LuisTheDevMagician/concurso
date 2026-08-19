# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This repo's only project is a Next.js app under `Next/`. All commands below must be run from `Next/`, not the repo root.

## Commands

Run from `Next/`:

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
- `disciplinas`: belongs to a concurso; has a color and `dias_semana` (comma-separated weekday numbers, `0`=Sunday–`6`=Saturday) controlling which days it shows on the weekly view.
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
- `app/layout.tsx` forces dark mode (`className="dark"` on `<html>`) — there is no light-mode toggle.

### Path aliases

`@/*` maps to `Next/*` (see `tsconfig.json` / `components.json`). Import app code as `@/lib/...`, `@/components/...`, etc.

### Notes

- `Next/AGENTS.md` is auto-generated/rewritten by `next dev` on each run (documents this version of Next.js differing from training data) — don't hand-edit it away permanently, and commit it if `next dev` regenerates it as part of your diff.
- All UI copy and domain vocabulary (concurso, disciplina, matéria, revisão) is in Portuguese; keep new UI text and identifiers consistent with this.
