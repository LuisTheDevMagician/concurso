export default function DisciplinaLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-9 w-36 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-12 animate-pulse rounded-xl border bg-card" />
        <div className="divide-y divide-dashed divide-border overflow-hidden rounded-xl border bg-card">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse px-4 py-3" />
          ))}
        </div>
      </div>
    </div>
  );
}
