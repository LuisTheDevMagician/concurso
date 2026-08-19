export function ColorLegend({
  items,
}: {
  items: { id: number; nome: string; cor: string }[];
}) {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 text-sm text-muted-foreground">
          <dt className="sr-only">{item.nome}</dt>
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: item.cor }}
            aria-hidden="true"
          />
          <dd>{item.nome}</dd>
        </div>
      ))}
    </dl>
  );
}
