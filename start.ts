import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = dirname(fileURLToPath(import.meta.url));
const NEXT_DIR = join(ROOT_DIR, "Next");

const children = new Set<ChildProcess>();
let isShuttingDown = false;

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: NEXT_DIR,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    children.add(child);

    child.on("exit", (code) => {
      children.delete(child);
      if (isShuttingDown || code === 0) {
        resolve();
      } else {
        reject(
          new Error(`"${command} ${args.join(" ")}" saiu com código ${code}`)
        );
      }
    });

    child.on("error", (err) => {
      children.delete(child);
      reject(err);
    });
  });
}

function shutdown(signal: NodeJS.Signals) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n→ Recebido ${signal}, encerrando tudo...`);
  for (const child of children) {
    child.kill(signal);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

async function main() {
  const nodeModulesExists = existsSync(join(NEXT_DIR, "node_modules"));
  const buildExists = existsSync(join(NEXT_DIR, ".next", "BUILD_ID"));

  if (!nodeModulesExists) {
    console.log("→ Instalando dependências (bun install)...");
    await run("bun", ["install"]);
  } else {
    console.log("→ Dependências já instaladas, pulando bun install.");
  }
  if (isShuttingDown) return;

  if (!buildExists) {
    console.log("→ Gerando build de produção (bun run build)...");
    await run("bun", ["run", "build"]);
  } else {
    console.log("→ Build já existe, pulando bun run build.");
  }
  if (isShuttingDown) return;

  console.log("→ Iniciando o servidor (bun run start)...\n");
  await run("bun", ["run", "start"]);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    if (isShuttingDown) {
      process.exit(0);
    } else {
      console.error(`\nErro: ${err.message}`);
      process.exit(1);
    }
  });
