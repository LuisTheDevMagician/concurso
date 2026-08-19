import { notFound } from "next/navigation";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { MateriaCard } from "@/components/materia-card";
import { NewMateriaButton } from "@/components/new-materia-button";
import { getConcurso, getDisciplina, getMaterias } from "@/lib/queries";

export default async function DisciplinaPage(
  props: PageProps<"/concursos/[concursoId]/disciplinas/[disciplinaId]">
) {
  const { concursoId, disciplinaId } = await props.params;
  const cId = Number(concursoId);
  const dId = Number(disciplinaId);
  if (!Number.isInteger(cId) || !Number.isInteger(dId)) notFound();

  const concurso = getConcurso(cId);
  const disciplina = getDisciplina(dId);
  if (!concurso || !disciplina || disciplina.concurso_id !== concurso.id) {
    notFound();
  }

  const materias = getMaterias(disciplina.id);
  const estudadas = materias.filter((m) => m.estudado).length;
  const pct = materias.length
    ? Math.round((estudadas / materias.length) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <AppBreadcrumb
        items={[
          { label: "Concursos", href: "/" },
          { label: concurso.nome, href: `/concursos/${concurso.id}` },
          { label: disciplina.nome },
        ]}
      />
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          {disciplina.nome}
        </h1>
        <NewMateriaButton disciplinaId={disciplina.id} />
      </div>

      {materias.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma matéria cadastrada ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3">
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {estudadas}/{materias.length}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {pct}%
            </span>
          </div>

          <div className="stagger-children divide-y divide-dashed divide-border overflow-hidden rounded-xl border bg-card">
            {materias.map((materia) => (
              <MateriaCard
                key={materia.id}
                materia={materia}
                disciplinaId={disciplina.id}
                cor={disciplina.cor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
