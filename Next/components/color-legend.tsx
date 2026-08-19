export function ColorLegend({
  items,
}: {
  items: { id: number; nome: string; cor: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: item.cor }}
          />
          {item.nome}
        </div>
      ))}
    </div>
  );
}
