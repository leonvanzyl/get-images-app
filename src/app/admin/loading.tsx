export default function AdminLoading() {
  return (
    <div className="px-8 py-10 md:px-12 md:py-12">
      <div className="mb-10 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border bg-card"
          />
        ))}
      </div>
    </div>
  );
}
