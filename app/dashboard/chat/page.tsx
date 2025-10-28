"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { chat as chatApi } from "@/services/chatService";
import { listAgents } from "@/services/agentService";
import { toast } from "sonner";
import Markdown from "@/components/markdown";

const MAX_INPUT = 4000;
const MAX_CONTEXT = 2000;

type Msg = { role: "user" | "assistant"; content: string; ts: number };

export default function ChatPage() {
  const router = useRouter();
  const search = useSearchParams();
  const initialAgentId = search.get("agentId") || "";
  const lockedAgent = Boolean(initialAgentId);

  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [agentId, setAgentId] = useState<string>(initialAgentId);
  const [input, setInput] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await listAgents({ page: 1, pageSize: 50 });
        const data = res.data?.agents || res.data?.data?.agents || [];
        setAgents(data.map((a: any) => ({ id: a.id, name: a.name })));
        if (initialAgentId) {
          setAgentId(initialAgentId);
        } else if (!agentId) {
          const last = typeof window !== "undefined" ? localStorage.getItem("last_agent") : null;
          if (last && data.some((a: any) => a.id === last)) {
            setAgentId(last);
          } else if (data[0]) {
            setAgentId(data[0].id);
          }
        }
      } catch (e: any) {
        toast.error(e?.response?.data?.message || e?.message || "Failed to load agents");
      }
    };
    loadAgents();
    // hydrate history for initial agent
    const aid = initialAgentId || "";
    if (aid) {
      const stored = localStorage.getItem(`chat:${aid}`);
      if (stored) setMessages(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    // persist per agent
    if (agentId) {
      localStorage.setItem(`last_agent`, agentId);
      localStorage.setItem(`chat:${agentId}`, JSON.stringify(messages));
    }
    // scroll to bottom on new message
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, agentId]);

  useEffect(() => {
    // load history when switching agent
    if (!agentId) return;
    const stored = localStorage.getItem(`chat:${agentId}`);
    if (stored) setMessages(JSON.parse(stored));
    else setMessages([]);
  }, [agentId]);

  const exportMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# Chat with Agent ${agents.find((a) => a.id === agentId)?.name || ""}`);
    lines.push("");
    messages.forEach((m) => {
      lines.push(`**${m.role.toUpperCase()}**:`);
      lines.push("");
      lines.push(m.content);
      lines.push("");
      lines.push("---");
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${agentId}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const send = async () => {
    if (!agentId) return toast.error("Please select an agent");
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", content: text, ts: Date.now() }]);
    setInput("");
    setLoading(true);
    try {
      const res = await chatApi(agentId, { message: text, context: context || undefined });
      const reply = res.data?.response || res.data?.message || "(no response)";
      setMessages((prev) => [...prev, { role: "assistant", content: reply, ts: Date.now() }]);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Chat failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center gap-3">
          <Label className="text-sm">Agent</Label>
          {!lockedAgent ? (
            <Select value={agentId} onValueChange={(v) => setAgentId(v)}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm text-muted-foreground">
              {agents.find((a) => a.id === agentId)?.name || agentId}
            </span>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => { setMessages([]); localStorage.setItem(`chat:${agentId}`, JSON.stringify([])); }}>Start new chat</Button>
            <Button variant="outline" onClick={() => { setMessages([]); localStorage.setItem(`chat:${agentId}`, JSON.stringify([])); }}>Clear chat</Button>
            <Button onClick={exportMarkdown}>Export .md</Button>
          </div>
        </div>

        <div ref={listRef} className="h-[520px] overflow-y-auto rounded-2xl border p-4 bg-muted/30">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No messages yet</div>
          ) : (
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div className="inline-flex items-start gap-2">
                    <span className={"inline-block max-w-[80%] whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-sm shadow " + (m.role === "user" ? "bg-white" : "bg-white") }>
                      {m.role === "assistant" ? <Markdown>{m.content}</Markdown> : m.content}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(m.content);
                        toast.success("Copied");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
              {loading && <div className="text-xs text-muted-foreground">Assistant is typing…</div>}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
            placeholder="Type your message..."
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{input.length} / {MAX_INPUT}</span>
            <Button onClick={send} disabled={loading || !agentId || !input.trim()}>Send</Button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-3">
        <div className="text-sm font-semibold">Advanced</div>
        <div className="space-y-2">
          <Label htmlFor="ctx">Context (optional)</Label>
          <Textarea id="ctx" rows={8} value={context} onChange={(e) => setContext(e.target.value.slice(0, MAX_CONTEXT))} placeholder="Provide extra context for the model..." />
          <div className="text-xs text-muted-foreground">{context.length} / {MAX_CONTEXT}</div>
        </div>
      </div>
    </div>
  );
}
