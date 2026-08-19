import { ColorLegend } from "@/components/color-legend";
import { ConcursoCard } from "@/components/concurso-card";
import { NewConcursoButton } from "@/components/new-concurso-button";
import { getConcursos } from "@/lib/queries";

export default function Home() {
  const concursos = getConcursos();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Concursos</h1>
          <p className="text-sm text-muted-foreground">
            Organize seus estudos por concurso, disciplina e matéria.
          </p>
        </div>
        <NewConcursoButton />
      </div>

      {concursos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum concurso cadastrado ainda.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {concursos.map((concurso) => (
              <ConcursoCard key={concurso.id} concurso={concurso} />
            ))}
          </div>
          <ColorLegend items={concursos} />
        </>
      )}
    </div>
  );
}
