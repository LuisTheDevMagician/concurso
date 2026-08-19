import { notFound } from "next/navigation";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { DisciplinaCard } from "@/components/disciplina-card";
import { NewDisciplinaButton } from "@/components/new-disciplina-button";
import { getConcurso, getDisciplinas } from "@/lib/queries";

export default async function ConcursoPage(
  props: PageProps<"/concursos/[concursoId]">
) {
  const { concursoId } = await props.params;
  const id = Number(concursoId);
  if (!Number.isInteger(id)) notFound();

  const concurso = getConcurso(id);
  if (!concurso) notFound();

  const disciplinas = getDisciplinas(concurso.id);

  return (
    <div className="flex flex-col gap-8">
      <AppBreadcrumb
        items={[{ label: "Concursos", href: "/" }, { label: concurso.nome }]}
      />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {concurso.nome}
        </h1>
        <NewDisciplinaButton concursoId={concurso.id} />
      </div>

      {disciplinas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma disciplina cadastrada ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {disciplinas.map((disciplina) => (
            <DisciplinaCard
              key={disciplina.id}
              disciplina={disciplina}
              concursoId={concurso.id}
              cor={concurso.cor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
