# Concurso Tracker

Um painel pessoal para organizar os estudos de concursos públicos: cadastre os concursos que está estudando, divida em disciplinas, liste as matérias de cada uma e acompanhe o progresso — com revisão espaçada automática e um calendário pra visualizar tudo.

## Hierarquia

```
Concurso → Disciplina → Matéria → Revisão
```

- **Concurso** — o exame em si (nome + cor).
- **Disciplina** — uma matéria do edital: cor própria, dias da semana de estudo e um link opcional para o material online.
- **Matéria** — um tópico dentro da disciplina, com checkbox de "estudado".
- **Revisão** — ao criar uma revisão para uma matéria, o app gera automaticamente 4 datas espaçadas (hoje, +7, +15 e +30 dias), mostradas no calendário do concurso.

## Funcionalidades

- Estrutura completa de CRUD para concursos, disciplinas e matérias.
- Revisão espaçada automática com calendário mensal navegável.
- Calendário na tela inicial mostrando em quais dias cada concurso tem estudo previsto.
- Link de material online por disciplina, com atalho para abrir em outra aba.
- Temas completos e trocáveis — não é só uma cor de destaque, é a aparência inteira.

## Temas

Um botão flutuante (ícone de paleta, canto inferior direito) troca entre temas completos:

- **Petróleo** — preto, cinza, branco e azul petróleo. O padrão.
- **Crystal Green** — vidro fosco verde, com blur de cristal ao estilo macOS.
- **Cyberpunk** — synthwave neon, magenta e ciano sobre violeta escuro.

A escolha fica salva no navegador e persiste entre visitas. Quer criar um tema novo? Veja a seção de temas em `CLAUDE.md`.

## Como rodar

Requer o [Bun](https://bun.com/get) instalado (runtime + gerenciador de pacotes do projeto).

```sh
git clone https://github.com/LuisTheDevMagician/concurso.git
cd concurso
bun start.ts
```

O `start.ts` cuida de tudo sozinho: instala as dependências (se ainda não existir `node_modules`), gera o build de produção (se ainda não existir `.next`) e sobe o servidor, imprimindo o link para abrir no navegador. Nas próximas vezes ele detecta que já está tudo pronto e pula direto para `bun run start`. `Ctrl+C` encerra tudo.

### Comandos manuais

Para rodar cada passo separadamente (por exemplo, para desenvolver com hot-reload), entre em `Next/`:

```sh
cd Next
bun install
bun run dev     # servidor de desenvolvimento
bun run build   # build de produção
bun run start   # roda o build de produção
bun run lint    # eslint
```

## Onde ficam os dados

O banco (SQLite) fica em `~/.local/share/concurso-tracker/concurso.db`, **fora** da pasta do projeto — assim o progresso não se perde se o repositório for reinstalado ou atualizado.

## Stack

Next.js (App Router) + React + TypeScript, SQLite via `better-sqlite3`, Tailwind CSS v4, componentes shadcn/ui sobre base-ui.
