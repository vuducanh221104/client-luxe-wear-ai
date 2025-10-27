import DocsLeftSidebar from "@/components/docs/DocsLeftSidebar";
import DocsOnThisPage from "@/components/docs/DocsOnThisPage";

export default function UserGuidesPage() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <DocsLeftSidebar />

          {/* Main Content */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Quick Start</div>
                <h1 className="mt-1 text-3xl md:text-4xl font-extrabold tracking-tight">Welcome to Chatbase</h1>
                <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
                  Get started with Chatbase and discover how to build intelligent agents trained on your business data.
                </p>
              </div>
              <button className="hidden md:inline-flex items-center rounded-lg border px-3 py-2 text-sm">Copy page</button>
            </div>

            <div className="mt-6 rounded-2xl border bg-muted/40 p-10 flex items-center justify-center">
              <img src="/logoGobal.svg" alt="Chatbase" className="h-12 w-auto" />
            </div>

            <h2 id="why-choose" className="mt-8 text-2xl md:text-3xl font-bold">Why Choose Chatbase?</h2>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[{ title: "Smart & Trainable", desc: "Train your AI Agent with your own documents, websites, or databases for accurate, relevant responses." }, { title: "Easy Integration", desc: "Embed anywhere with simple copy-paste code - no technical expertise required." }, { title: "Interactive Actions", desc: "Pre-built actions for Slack, Stripe, Calendly, lead collection, and web search + custom actions for any API." }, { title: "Powerful Analytics", desc: "Track conversations, monitor performance, and continuously improve your AI Agent." }, { title: "Lead Generation", desc: "Capture and manage leads automatically through intelligent conversations." }, { title: "Deploy Everywhere", desc: "Integrations across platforms like WordPress, Shopify, WhatsApp, Slack, Zendesk, and more." }].map((c) => (
                <div key={c.title} className="rounded-2xl border p-5 bg-background">
                  <div className="text-sm font-semibold">{c.title}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Aside */}
          <DocsOnThisPage />
        </div>
      </div>
    </section>
  );
}
