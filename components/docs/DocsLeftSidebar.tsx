export default function DocsLeftSidebar() {
  return (
    <aside className="hidden lg:block lg:col-span-3">
      <div className="sticky top-24 space-y-6">
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">Quick Start</div>
          <nav className="space-y-1">
            <a className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium" href="/docs/user-guides">
              <span className="text-zinc-400">✦</span> Welcome to Chatbase
            </a>
            <a className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted" href="/docs/your-first-agent">
              <span className="text-zinc-400">🔑</span> Build Your First AI Agent
            </a>
            <a className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted" href="/pricing">
              <span className="text-zinc-400">☆</span> Best Practices
            </a>
          </nav>
        </div>

        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">AI Agent Management</div>
          <nav className="space-y-1">
            <a className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted" href="/dashboard">
              <span className="text-zinc-400">▶</span> Playground
            </a>
            <a className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted" href="/auth/login">
              <span className="text-zinc-400">▦</span> Sources
            </a>
            <a className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted" href="/auth/register">
              <span className="text-zinc-400">⚙</span> Settings
            </a>
          </nav>
        </div>
      </div>
    </aside>
  );
}
