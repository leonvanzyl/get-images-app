export default function DashboardLoading() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-16">
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          ● Loading
        </p>
        <p className="mt-4 font-mono text-sm uppercase tracking-[0.18em] text-foreground">
          Buffering frame<span className="animate-cursor-blink">…</span>
        </p>
      </div>
    </section>
  );
}
