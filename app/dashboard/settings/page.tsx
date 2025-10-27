export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">General</h1>

      {/* Agent details */}
      <section className="rounded-2xl border bg-background p-6">
        <div className="text-lg font-semibold">Agent details</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Basic information about the agent, including its name, unique ID, and storage size.
        </p>

        <div className="mt-6 grid gap-4">
          <div className="rounded-xl bg-muted/40 p-4">
            <div className="text-sm text-muted-foreground">Agent ID</div>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span>xlx1i_kx-K9ZdfUyY9Vbk</span>
              <button className="h-7 w-7 rounded-lg border">📋</button>
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 p-4">
            <div className="text-sm text-muted-foreground">Size</div>
            <div className="mt-1 text-sm">5 B</div>
          </div>

          <div>
            <label className="text-sm font-medium">Name</label>
            <input defaultValue="Agent" className="mt-2 w-full rounded-lg border px-3 py-2" />
          </div>

          <div className="flex justify-end">
            <button className="rounded-lg bg-foreground px-4 py-2 text-background text-sm font-semibold">Save</button>
          </div>
        </div>
      </section>

      {/* Credits limit */}
      <section className="rounded-2xl border bg-background p-6">
        <div className="text-lg font-semibold">Credits limit</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Maximum credits to be used by this agent from the credits available on the workspace.
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">Set credits limit on agent:</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          <input placeholder="Enter credit limit" className="w-full rounded-lg border px-3 py-2" />
          <div className="flex justify-end">
            <button className="rounded-lg bg-foreground px-4 py-2 text-background text-sm font-semibold">Save</button>
          </div>
        </div>
      </section>

      {/* Danger zone label */}
      <div className="relative">
        <div className="absolute left-0 right-0 top-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-red-600">
          Danger Zone
        </div>
      </div>

      {/* Delete all conversations */}
      <section className="rounded-2xl border bg-background p-6">
        <div className="text-lg font-semibold">Delete all conversations</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Once you delete all your conversations, there is no going back. Please be certain. All the conversations on
          this agent will be deleted.
        </p>
        <div className="mt-4 flex justify-end">
          <button className="rounded-lg bg-red-600 px-4 py-2 text-white text-sm font-semibold">Delete</button>
        </div>
      </section>

      {/* Delete agent */}
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="text-lg font-semibold">Delete agent</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Once you delete your agent, there is not going back. Please be certain.
        </p>
        <div className="mt-4 flex justify-end">
          <button className="rounded-lg bg-red-600 px-4 py-2 text-white text-sm font-semibold">Delete</button>
        </div>
      </section>
    </div>
  );
}
