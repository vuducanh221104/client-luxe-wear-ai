export default function UsagePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Usage</h1>

      {/* Filters */}
      <div className="flex items-center gap-3 justify-end">
        <select className="h-9 rounded-lg border bg-background px-3 text-sm">
          <option>All agents</option>
          <option>Agent</option>
        </select>
        <button className="h-9 rounded-lg border bg-background px-3 text-sm">Oct 01, 2025 - Oct 20, 2025</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4">
          <div className="text-3xl font-bold">0</div>
          <div className="text-xs text-muted-foreground">/ 100 Credits used</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-3xl font-bold">1</div>
          <div className="text-xs text-muted-foreground">Agents used</div>
        </div>
      </div>

      {/* Usage history */}
      <section className="rounded-2xl border p-4">
        <div className="text-sm font-semibold">Usage history</div>
        <div className="mt-4 h-48 rounded-lg bg-muted/30" />
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i}>Oct {i + 1}</span>
          ))}
        </div>
      </section>

      {/* Credits used per agent */}
      <section className="rounded-2xl border p-4">
        <div className="text-sm font-semibold">Credits used per agent</div>
        <div className="mt-6 h-64 rounded-lg bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
          No data available
        </div>
      </section>
    </div>
  );
}
