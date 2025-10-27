import DocsLeftSidebar from "@/components/docs/DocsLeftSidebar";
import DocsOnThisPage from "@/components/docs/DocsOnThisPage";

export default function YourFirstAgentPage() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <DocsLeftSidebar />

          <div className="lg:col-span-7">
            {/* Header */}
            <header>
              <div className="space-y-2">
                <div className="h-5 text-primary text-sm font-semibold">Quick Start</div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Build Your First AI Agent</h1>
                  <div className="items-center shrink-0 min-w-[156px] justify-end ml-auto hidden sm:flex">
                    <button className="rounded-l-xl px-3 py-1.5 border bg-background">Copy page</button>
                    <button className="rounded-r-xl px-3 py-1.5 border border-l-0 bg-background">⋯</button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-lg text-muted-foreground">
                Create, train, and deploy your first AI Agent in under 5 minutes. Follow this step-by-step guide to get your intelligent assistant live on your website.
              </p>
              <div className="items-center shrink-0 min-w-[156px] mt-3 flex sm:hidden">
                <button className="rounded-l-xl px-3 py-1.5 border bg-background">Copy page</button>
                <button className="rounded-r-xl px-3 py-1.5 border border-l-0 bg-background">⋯</button>
              </div>
            </header>

            {/* Content */}
            <div className="mt-8 prose prose-gray dark:prose-invert max-w-none">
              <p>
                In just a few minutes, you’ll have a fully functional AI Agent answering questions about your business and engaging with your website visitors. Let’s get started!
              </p>

              <h2 id="prerequisites">Prerequisites</h2>
              <div className="my-4 px-5 py-4 overflow-hidden rounded-2xl flex gap-3 border bg-zinc-50/50 dark:bg-zinc-500/10">
                <div className="mt-0.5 w-4 text-zinc-400">i</div>
                <div className="text-sm">
                  You’ll need an active Chatbase account to follow this guide. <a className="underline" href="https://www.chatbase.co/auth/signup" target="_blank" rel="noreferrer">Sign up here</a> if you haven’t already.
                </div>
              </div>

              <h2 id="overview">Overview</h2>
              <p>Here’s what we’ll accomplish in this guide:</p>
              <ol className="ml-4 mt-4 space-y-4">
                <li>
                  <div className="font-semibold">Create & Train Your Agent</div>
                  <div>Set up a new AI Agent and train it using your website or documents</div>
                </li>
                <li>
                  <div className="font-semibold">Test & Optimize</div>
                  <div>Use the Playground to test responses and fine-tune performance using the Compare feature</div>
                </li>
                <li>
                  <div className="font-semibold">Deploy to your Website</div>
                  <div>Add your AI Agent to your website with a simple embed code</div>
                </li>
              </ol>

              <div className="my-4 px-5 py-4 overflow-hidden rounded-2xl flex gap-3 border bg-emerald-50/50 dark:bg-emerald-500/10">
                <div className="mt-0.5 w-4 text-emerald-600">⏱</div>
                <div className="text-sm">
                  <strong>Estimated time:</strong> 5 minutes from start to finish
                </div>
              </div>

              <h2 id="step-1">Step 1: Create &amp; Train Your AI Agent</h2>
              <h3 id="dashboard">Navigate to Your Dashboard</h3>
              <p>After signing into your Chatbase account, go to your main dashboard. Click the <strong>“New AI Agent”</strong> button to get started.</p>
              <div className="rounded-2xl overflow-hidden border bg-muted/40 p-2">
                <img src="https://mintcdn.com/chatbase/JnjROJ-aB2q57UGe/user-guides/quick-start/images/first-agent/create-agent.png?fit=max&auto=format&q=85" alt="Chatbase dashboard with New AI Agent button highlighted" />
              </div>

              <h3 id="training">Choose Your Training Data</h3>
              <p>Your AI Agent needs information to learn from. You can train it using various data sources:</p>
              <div className="mt-4 border-b">
                <div className="flex gap-6 text-sm">
                  <div className="border-b-2 border-foreground pb-2 font-semibold">Files</div>
                  <div className="text-muted-foreground pb-2">Raw Text</div>
                  <div className="text-muted-foreground pb-2">Website</div>
                  <div className="text-muted-foreground pb-2">Q&amp;A</div>
                  <div className="text-muted-foreground pb-2">Notion</div>
                </div>
              </div>
              <p><strong>Upload your documents</strong></p>
              <p>Train your agent on your documents. <strong>Best for:</strong> Business documents, manuals, FAQs, product information, etc.</p>
              <div className="rounded-2xl overflow-hidden border bg-muted/40 p-2">
                <img src="https://mintcdn.com/chatbase/4kdBs__Z0wOL088A/user-guides/quick-start/images/first-agent/uploading-files.png?fit=max&auto=format&q=85" alt="Sources tab with Files option selected and a file being uploaded" />
              </div>

              <h3 id="review-train">Review &amp; Start Training</h3>
              <p>Click <strong>“Create Agent”</strong> to begin the training process.</p>
              <div className="rounded-2xl overflow-hidden border bg-muted/40 p-2">
                <img src="https://mintcdn.com/chatbase/4kdBs__Z0wOL088A/user-guides/quick-start/images/first-agent/sources-create-agent.png?fit=max&auto=format&q=85" alt="Sources tab with Create Agent button highlighted" />
              </div>

              <div className="my-4 px-5 py-4 overflow-hidden rounded-2xl flex gap-3 border bg-emerald-50/50 dark:bg-emerald-500/10">
                <div className="mt-0.5 w-4 text-emerald-600">✔</div>
                <div className="text-sm">Training typically takes 2-5 minutes depending on the amount of data. You can proceed to the next step while training completes.</div>
              </div>
              <div className="my-4 px-5 py-4 overflow-hidden rounded-2xl flex gap-3 border bg-zinc-50/50 dark:bg-zinc-500/10">
                <div className="mt-0.5 w-4 text-zinc-400">i</div>
                <div className="text-sm"><strong>Character Limits:</strong> Different plans have different character limits for training data. Check your plan if you hit any limits.</div>
              </div>

              <h2 id="step-2">Step 2: Test &amp; Optimize Your AI Agent</h2>
              <h3 id="playground">Access the Playground</h3>
              <p>
                Once training begins, you’ll automatically be taken to the <a className="underline" href="/docs/user-guides/chatbot/playground"><strong>Playground</strong></a> - your testing environment where you can chat with your AI Agent and fine-tune it before making it live.
              </p>
              <div className="rounded-2xl overflow-hidden border bg-muted/40 p-2">
                <img src="https://mintcdn.com/chatbase/Zkg12EbnhYTJTGwv/user-guides/quick-start/images/first-agent/getting-started-9.png?fit=max&auto=format&q=85" alt="Playground interface showing chat testing area" />
              </div>

              <h3 id="models">Test responses with different models</h3>
              <ol className="ml-4 mt-4 space-y-4">
                <li>
                  <div className="font-semibold">Test with different models</div>
                  <div>Ask the same questions to different models and compare quality, speed, tone, and edge cases handling.</div>
                  <div className="mt-3 rounded-2xl overflow-hidden border bg-muted/40 p-2">
                    <img src="https://mintcdn.com/chatbase/4kdBs__Z0wOL088A/user-guides/quick-start/images/first-agent/playground-select-models.png?fit=max&auto=format&q=85" alt="Playground interface showing select models button" />
                  </div>
                </li>
                <li>
                  <div className="font-semibold">Make Your Decision</div>
                  <div>Pick the model that best fits your use case and brand voice.</div>
                </li>
              </ol>
              <div className="my-4 px-5 py-4 overflow-hidden rounded-2xl flex gap-3 border bg-emerald-50/50 dark:bg-emerald-500/10">
                <div className="mt-0.5 w-4 text-emerald-600">💡</div>
                <div className="text-sm">For advanced testing and comparison tips, see the model comparison guide.</div>
              </div>

              <h2 id="step-3">Step 3: Deploy to Your Website</h2>
              <h3 id="deploy">Navigate to the Deploy Section</h3>
              <p>
                Once you’re satisfied with your AI Agent’s responses, navigate to the <strong>Deploy</strong> tab and click <strong>Update</strong> to make it public.
              </p>
              <div className="rounded-2xl overflow-hidden border bg-muted/40 p-2">
                <img src="https://mintcdn.com/chatbase/JnjROJ-aB2q57UGe/user-guides/quick-start/images/first-agent/change-visibility.png?fit=max&auto=format&q=85" alt="Deploy tab with Make Public button highlighted" />
              </div>
              <div className="my-4 px-5 py-4 overflow-hidden rounded-2xl flex gap-3 border bg-zinc-50/50 dark:bg-zinc-500/10">
                <div className="mt-0.5 w-4 text-zinc-400">i</div>
                <div className="text-sm"><strong>Private vs Public:</strong> Private agents are only accessible to workspace members. Public agents can be embedded on websites and accessed by anyone with the link.</div>
              </div>

              <h3 id="embed">Get Your Embed Code</h3>
              <p>In this guide we’ll use the <strong>Chat widget</strong> option. Copy the provided JavaScript code snippet and add it to your site.</p>
              <div className="rounded-2xl overflow-hidden border bg-muted/40 p-2">
                <img src="https://mintcdn.com/chatbase/JnjROJ-aB2q57UGe/user-guides/quick-start/images/first-agent/copy-embed-code.png?fit=max&auto=format&q=85" alt="JavaScript embed code ready to copy" />
              </div>

              <h3 id="add-code">Add Code to Your Website</h3>
              <ol className="ml-4 mt-4 space-y-4">
                <li>
                  <div className="font-semibold">Locate Your Site's HTML</div>
                  <div>Place the script before the closing body tag for fast loading or in head for immediate availability.</div>
                </li>
                <li>
                  <div className="font-semibold">Paste the Code</div>
                  <div>Copy and paste the embed script into your website’s HTML or CMS custom HTML area.</div>
                </li>
                <li>
                  <div className="font-semibold">Save and Publish</div>
                  <div>Save your changes and publish your website updates.</div>
                </li>
              </ol>

              <h3 id="verify">Verify Installation</h3>
              <p>Visit your website and look for the chat bubble. Click it to test the integration!</p>
              <div className="rounded-2xl overflow-hidden border bg-muted/40 p-2">
                <img src="https://mintcdn.com/chatbase/Zkg12EbnhYTJTGwv/user-guides/quick-start/images/first-agent/getting-started-15.png?fit=max&auto=format&q=85" alt="Live AI Agent chat bubble on a website" />
              </div>
              <div className="my-4 px-5 py-4 overflow-hidden rounded-2xl flex gap-3 border bg-emerald-50/50 dark:bg-emerald-500/10">
                <div className="mt-0.5 w-4 text-emerald-600">✔</div>
                <div className="text-sm"><strong>Success!</strong> Your AI Agent is now live and ready to help your website visitors.</div>
              </div>

              <h2 id="congrats">🎉 Congratulations!</h2>
              <p>You’ve successfully created, trained, tested, and deployed your first AI Agent! Here’s what you’ve accomplished:</p>
              <ul className="list-disc ml-5">
                <li>Created an intelligent AI Agent trained on your data</li>
                <li>Tested and validated response quality</li>
                <li>Deployed it live on your website</li>
                <li>Made it accessible to your visitors 24/7</li>
              </ul>

              <h3 id="whats-next">What’s Next?</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <a className="block rounded-2xl border p-5 hover:border-foreground" href="#">
                  <div className="text-base font-semibold">Monitor Performance</div>
                  <p className="mt-1 text-sm">Track conversations and optimize your AI Agent’s performance</p>
                </a>
                <a className="block rounded-2xl border p-5 hover:border-foreground" href="#">
                  <div className="text-base font-semibold">Advanced Features</div>
                  <p className="mt-1 text-sm">Add actions like lead capture, appointment booking, and more</p>
                </a>
                <a className="block rounded-2xl border p-5 hover:border-foreground" href="#">
                  <div className="text-base font-semibold">Best Practices</div>
                  <p className="mt-1 text-sm">Learn proven strategies to maximize your AI Agent’s effectiveness</p>
                </a>
                <a className="block rounded-2xl border p-5 hover:border-foreground" href="#">
                  <div className="text-base font-semibold">API Integration</div>
                  <p className="mt-1 text-sm">Build custom integrations with our powerful API</p>
                </a>
              </div>
            </div>
          </div>

          <DocsOnThisPage
            items={[
              { id: "prerequisites", label: "Prerequisites" },
              { id: "overview", label: "Overview" },
              { id: "step-1", label: "Step 1: Create & Train" },
              { id: "step-2", label: "Step 2: Test & Optimize" },
              { id: "step-3", label: "Step 3: Deploy" },
              { id: "congrats", label: "Congratulations" },
              { id: "whats-next", label: "What’s Next?" },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
