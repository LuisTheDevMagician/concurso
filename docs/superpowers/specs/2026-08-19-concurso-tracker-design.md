# Concurso Tracker — Design

Status: approved (pending final spec review)
Date: 2026-08-19

## Purpose

App pessoal e básico para acompanhar o estudo para concursos públicos.
Hierarquia fixa de três níveis, tudo cadastrado manualmente pelo usuário
(sem seed de dados, sem múltiplos usuários/auth). Uso local, sem deploy.

## Stack

- Next.js 16 (App Router), já scaffolded em `Next/` (renomeado de `frontend/`
  pelo usuário; bun como package manager).
- SQLite via `better-sqlite3`, sem ORM — schema pequeno o suficiente para
  SQL cru com uma camada fina de helpers tipados.
- Server Actions para todo o CRUD (sem API routes separadas).
- shadcn/ui para os componentes (Card, Button, Dialog, Input, Checkbox,
  Breadcrumb, DropdownMenu para o menu ⋮).
- Tema escuro fixo (sem toggle, sem suporte a light mode).
- Banco em `Next/data/concurso.db`, fora do controle de versão.

Nota de implementação: este Next.js é uma versão com breaking changes em
relação ao treinamento do modelo (ver `Next/AGENTS.md`). Antes de escrever
código de rotas/server actions, consultar
`Next/node_modules/next/dist/docs/01-app/` para convenções atuais (ex.:
formato de `params` em rotas dinâmicas, convenções de Server Actions).

## Modelo de dados

```sql
CREATE TABLE concursos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL,              -- hex, ex: "#22c55e"
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE disciplinas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concurso_id INTEGER NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE materias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  estudado INTEGER NOT NULL DEFAULT 0,  -- 0/1
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Foreign keys com `ON DELETE CASCADE` (precisa `PRAGMA foreign_keys = ON`
na conexão). Ordenação sempre por `created_at`/`id` — sem reordenação manual.

Progresso ("N/M estudadas") é calculado on-the-fly via `COUNT`/`SUM`, não
armazenado.

## Cor do concurso

- Escolhida via `<input type="color">` (seletor livre, hex) num Dialog de
  criação/edição de concurso.
- Usada em três lugares:
  1. Card do concurso na página `/` (acento visual — ex. borda/faixa lateral
     na cor, texto neutro por cima pra manter legibilidade no tema escuro).
  2. Legenda abaixo da lista de concursos: bolinha colorida + nome, uma
     linha por concurso.
  3. Como acento (mesmo tratamento visual) nos cards de Disciplina e nos
     cards de Matéria daquele concurso, ao navegar pra dentro dele — reforça
     contexto visual sem repetir a cor de forma poluída.
- Sem paleta fixa — qualquer hex é aceito. Não há validação de contraste;
  fica a critério do usuário escolher cores legíveis no fundo escuro.

## Páginas e navegação

Drill-down por páginas, com breadcrumb, cards em vez de listas.

1. **`/`** — Cards de Concurso (nome, contador de progresso agregando todas
   as matérias do concurso, acento de cor). Botão "Novo concurso" abre
   Dialog (nome + color picker). Legenda de cores abaixo da grade de cards.
   Menu ⋮ em cada card: Editar (mesmo Dialog, preenchido) / Apagar
   (Dialog de confirmação, cascata pra disciplinas e matérias).

2. **`/concursos/[id]`** — Breadcrumb "Concursos / {nome do concurso}".
   Cards de Disciplina (nome, contador de progresso das matérias daquela
   disciplina, acento de cor do concurso pai). Botão "Nova disciplina"
   (Dialog só com nome). Menu ⋮ igual ao de Concurso (editar nome / apagar
   com cascata pra matérias).

3. **`/concursos/[id]/disciplinas/[id]`** — Breadcrumb completo
   "Concursos / {concurso} / {disciplina}". Cards de Matéria: nome +
   checkbox "estudado" inline (toggle direto via Server Action, sem abrir
   Dialog) + menu ⋮ (editar nome / apagar). Botão "Nova matéria" (Dialog só
   com nome).

Sem autenticação, sem múltiplos usuários — é uso pessoal e local.

## Server Actions (CRUD)

Uma função por operação, colocadas perto do que operam (ex.
`app/actions/concursos.ts`, `app/actions/disciplinas.ts`,
`app/actions/materias.ts`):

- `createConcurso(nome, cor)`, `updateConcurso(id, nome, cor)`,
  `deleteConcurso(id)`
- `createDisciplina(concursoId, nome)`, `updateDisciplina(id, nome)`,
  `deleteDisciplina(id)`
- `createMateria(disciplinaId, nome)`, `updateMateria(id, nome)`,
  `deleteMateria(id)`, `toggleMateriaEstudado(id)`

Cada action revalida o path relevante (`revalidatePath`) após escrever no
banco. Validação mínima: nome não pode ser vazio; cor precisa bater com
formato hex (`^#[0-9a-fA-F]{6}$`).

## Testes

Projeto de estudo pessoal, sem necessidade de suíte de testes automatizados
formal. Verificação manual via `bun dev`, cobrindo os fluxos principais:
criar/editar/apagar em cada nível, toggle de matéria, cascata de delete, e
conferir que os contadores de progresso batem.

## Fora de escopo (YAGNI)

- Autenticação / múltiplos usuários.
- Reordenação manual de itens (drag and drop).
- Paleta fixa de cores / validação de contraste.
- Tema claro / toggle de tema.
- Deploy, CI, testes automatizados.
- Edição em lote, busca, filtros.
