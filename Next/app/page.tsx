import { ColorLegend } from "@/components/color-legend";
import { ConcursoCard } from "@/components/concurso-card";
import { NewConcursoButton } from "@/components/new-concurso-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getConcursos, getConcursosComDia } from "@/lib/queries";
import { DIAS_SEMANA_FULL, getDiaAtual } from "@/lib/utils";

export default function Home() {
  const concursos = getConcursos();
  const diaAtual = getDiaAtual();
  const concursosHoje = getConcursosComDia(diaAtual);

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
          {concursosHoje.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {DIAS_SEMANA_FULL[diaAtual]}
                </h2>
                <Badge variant="secondary">Hoje</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {concursosHoje.map((c) => (
                  <ConcursoCard key={c.id} concurso={c} />
                ))}
              </div>
            </section>
          )}

          {concursosHoje.length > 0 && concursos.length > concursosHoje.length ? (
            <Separator />
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {concursos
              .filter((c) => !concursosHoje.some((h) => h.id === c.id))
              .map((concurso) => (
                <ConcursoCard key={concurso.id} concurso={concurso} />
              ))}
          </div>
          <ColorLegend items={concursos} />
        </>
      )}
    </div>
  );
}
