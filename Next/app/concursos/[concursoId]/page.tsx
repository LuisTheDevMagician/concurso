import { notFound } from "next/navigation";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { ConcursoContent } from "@/components/concurso-content";
import {
  getConcurso,
  getDisciplinas,
  getMateriasDoConcurso,
  getRevisoesDoMes,
} from "@/lib/queries";
import { parseDiasSemana } from "@/lib/utils";

export default async function ConcursoPage(
  props: PageProps<"/concursos/[concursoId]">
) {
  const { concursoId } = await props.params;
  const id = Number(concursoId);
  if (!Number.isInteger(id)) notFound();

  const concurso = getConcurso(id);
  if (!concurso) notFound();

  const disciplinas = getDisciplinas(concurso.id);
  const comDia = disciplinas.filter(
    (d) => parseDiasSemana(d.dias_semana).length > 0
  );
  const materias = getMateriasDoConcurso(concurso.id);
  const now = new Date();
  const revisoes = getRevisoesDoMes(concurso.id, now.getFullYear(), now.getMonth());

  return (
    <div className="flex flex-col gap-8">
      <AppBreadcrumb
        items={[{ label: "Concursos", href: "/" }, { label: concurso.nome }]}
      />
      <ConcursoContent
        concurso={concurso}
        disciplinas={disciplinas}
        comDia={comDia}
        materias={materias}
        revisoes={revisoes}
        ano={now.getFullYear()}
        mes={now.getMonth()}
      />
    </div>
  );
}
