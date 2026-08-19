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
        <h1 className="text-2xl font-semibold tracking-tight">
          {disciplina.nome}
        </h1>
        <NewMateriaButton disciplinaId={disciplina.id} />
      </div>

      {materias.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma matéria cadastrada ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {materias.map((materia) => (
            <MateriaCard
              key={materia.id}
              materia={materia}
              disciplinaId={disciplina.id}
              cor={concurso.cor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
