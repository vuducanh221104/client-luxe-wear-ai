export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agents</h1>
        <button className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-white text-sm font-semibold">
          <span className="inline-block h-4 w-4 rounded-full bg-white/20" /> New AI agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Card */}
        <div className="rounded-2xl border overflow-hidden">
          <div className="relative h-56 bg-gradient-to-r from-blue-400 to-blue-600">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="z-20 flex h-[90%] w-[42%] flex-col items-center justify-start overflow-hidden rounded-t-md">
                <div
                  className="flex h-10 w-full flex-row items-center justify-start gap-2 rounded-t-[7px] px-3 py-2"
                  style={{ background: "linear-gradient(0deg, rgba(0, 0, 0, 0.02) 0.44%, rgba(0, 0, 0, 0) 49.5%), rgb(59, 129, 246)" }}
                >
                  <p className="line-clamp-1 w-full font-medium text-[8px] text-white">Agent</p>
                </div>
                <div className="relative flex w-full flex-grow flex-col gap-2 overflow-auto bg-white p-2">
                  <div className="z-10 w-1/2 max-w-full flex-col gap-2 rounded-xl px-4 py-3 bg-zinc-200/50" />
                  <div className="z-10 ml-auto w-1/2 max-w-full rounded-xl px-4 py-3" style={{ backgroundColor: "rgb(59, 129, 246)" }} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-semibold">Agent</div>
              <div className="text-xs text-muted-foreground">Last trained 7 hours ago</div>
            </div>
            <button className="h-9 w-9 rounded-lg border">⋯</button>
          </div>
        </div>
      </div>
    </div>
  );
}
