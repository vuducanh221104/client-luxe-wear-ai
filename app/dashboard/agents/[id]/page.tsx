"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// Tabs removed; we will render by URL tab param
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getAgent, updateAgent, deleteAgent, regenerateApiKey, togglePublic } from "@/services/agentService";
import { getAgentAnalytics } from "@/services/analyticsService";

export default function AgentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = String(params?.id || "");
  const currentTab = (searchParams?.get("tab") || "config") as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [allowedOrigins, setAllowedOrigins] = useState<string[]>([]);
  const [newOrigin, setNewOrigin] = useState("");

  const [model, setModel] = useState("gemini-1.5-pro");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(2048);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");

  const [analytics, setAnalytics] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAgent(agentId);
        const data = res.data || res;
        setName(data.name || "");
        setDescription(data.description || "");
        const cfg = data.config || {};
        setModel(cfg.model || "gemini-1.5-pro");
        setTemperature(typeof cfg.temperature === "number" ? cfg.temperature : 0.7);
        setMaxTokens(typeof cfg.maxTokens === "number" ? cfg.maxTokens : 2048);
        setSystemPrompt(cfg.systemPrompt || "");
        setInstructions(cfg.instructions || "");
        setIsPublic(Boolean(data.isPublic ?? data.is_public));
        setAllowedOrigins((data.allowedOrigins ?? data.allowed_origins) || []);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || e?.message || "Failed to load agent");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
      try {
        const a = await getAgentAnalytics(agentId);
        setAnalytics(a.data || a);
      } catch {}
    };
    if (agentId) load();
  }, [agentId, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        description,
        config: { model, temperature, maxTokens, systemPrompt, instructions },
      };
      const res = await updateAgent(agentId, payload);
      if (res.success) {
        toast.success("Agent updated");
        setEditMode(false);
      } else {
        toast.error(res.message || "Failed to update agent");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to update agent");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateKey = async () => {
    try {
      const res = await regenerateApiKey(agentId);
      const data = res.data || res;
      if (res.success || data.apiKey) {
        setApiKey(data.apiKey || null);
        setShowApiKey(true);
        toast.success("API key regenerated - copy it now");
      } else {
        toast.error(res.message || "Failed to regenerate key");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to regenerate key");
    }
  };

  const handleTogglePublic = async (checked: boolean) => {
    try {
      const res = await togglePublic(agentId, checked, allowedOrigins);
      if (res.success) {
        setIsPublic(checked);
        toast.success("Public status updated");
      } else {
        toast.error(res.message || "Failed to update public status");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to update public status");
    }
  };

  const addOrigin = () => {
    const v = newOrigin.trim();
    if (!v) return;
    try {
      const url = new URL(v);
      const normalized = `${url.protocol}//${url.host}`;
      if (allowedOrigins.includes(normalized)) return;
      if (allowedOrigins.length >= 10) {
        toast.error("Maximum 10 origins");
        return;
      }
      setAllowedOrigins((prev) => [...prev, normalized]);
      setNewOrigin("");
    } catch {
      toast.error("Invalid URL");
    }
  };

  const removeOrigin = (origin: string) => {
    setAllowedOrigins((prev) => prev.filter((o) => o !== origin));
  };

  const saveOrigins = async () => {
    try {
      const res = await updateAgent(agentId, { allowed_origins: allowedOrigins, is_public: isPublic });
      if (res.success) toast.success("Origins saved");
      else toast.error(res.message || "Failed to save origins");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to save origins");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        <div className="h-64 w-full bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{name || "Agent"}</h1>
          <p className="text-sm text-muted-foreground">Manage configuration, API key, knowledge and analytics</p>
        </div>
        {currentTab === "config" && (
          <div className="flex gap-2">
            <Button variant={editMode ? "secondary" : "outline"} onClick={() => setEditMode((v) => !v)}>
              {editMode ? "Cancel" : "Enable edit"}
            </Button>
            <Button onClick={handleSave} disabled={!editMode || saving}>{saving ? "Saving..." : "Save"}</Button>
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>Delete Agent</Button>
          </div>
        )}
      </div>

      {currentTab === "config" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!editMode} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={model} onValueChange={setModel} disabled={!editMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-1.5-pro">gemini-1.5-pro</SelectItem>
                  <SelectItem value="gemini-2.5-flash">gemini-2.5-flash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={!editMode} rows={3} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Temperature</Label>
              <Input type="number" step={0.1} min={0} max={2} value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} disabled={!editMode} />
            </div>
            <div className="space-y-2">
              <Label>Max tokens</Label>
              <Input type="number" min={1} max={4096} value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} disabled={!editMode} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>System prompt</Label>
            <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} disabled={!editMode} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} disabled={!editMode} rows={3} />
          </div>
        </div>
      )}

      {currentTab === "api" && (
        <div className="space-y-4">
          <div className="rounded-2xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">API Key</div>
                <div className="text-xs text-muted-foreground">Keep it secret. Regenerate to revoke old key.</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRegenerateKey} variant="outline">Regenerate API Key</Button>
                <Button onClick={() => { if (apiKey) { navigator.clipboard.writeText(apiKey); toast.success("Copied"); } }} disabled={!apiKey}>
                  Copy key
                </Button>
              </div>
            </div>
            {apiKey && (
              <div className="rounded-md bg-muted p-3 text-sm break-all">
                {showApiKey ? apiKey : "••••••••••••••••••••••••••••••"}
                <Button variant="ghost" className="ml-2 h-6 px-2" onClick={() => setShowApiKey((v) => !v)}>
                  {showApiKey ? "Hide" : "Show"}
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Public access</div>
                <div className="text-xs text-muted-foreground">Enable to allow usage from external origins</div>
              </div>
              <Switch checked={isPublic} onCheckedChange={handleTogglePublic} />
            </div>
            {isPublic && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="https://example.com" value={newOrigin} onChange={(e) => setNewOrigin(e.target.value)} />
                  <Button variant="outline" onClick={addOrigin}>Add</Button>
                  <Button onClick={saveOrigins}>Save</Button>
                </div>
                <div className="space-y-2">
                  {allowedOrigins.length === 0 && (
                    <p className="text-xs text-muted-foreground">No origins configured</p>
                  )}
                  {allowedOrigins.map((o) => (
                    <div key={o} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span>{o}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeOrigin(o)}>Remove</Button>
                    </div>
                  ))}
                </div>
                <div className="rounded-md border p-3 text-xs">
                  <div className="font-medium mb-1">Embed snippet</div>
                  {!isPublic || allowedOrigins.length === 0 ? (
                    <div className="text-orange-600">Warning: Enable public and configure allowed origins to use the snippet.</div>
                  ) : (
                    <pre className="whitespace-pre-wrap break-words">{`<script>
async function chatWithAgent(message){
  const res = await fetch('${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"}/api/public/agents/${agentId}/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json','X-API-Key':'YOUR_API_KEY'},
    body: JSON.stringify({ message })
  });
  const data = await res.json();
  return data?.data?.response;
}
</script>`}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {currentTab === "embed" && (
        <div className="space-y-4">
          <div className="rounded-2xl border p-4 space-y-3">
            <div className="text-sm font-medium">Embed Chat Widget</div>
            <div className="text-xs text-muted-foreground">Use this iframe to embed the chat widget into any website. Ensure this agent is public and allowed origins are configured.</div>
            <div className="rounded-lg overflow-hidden border">
              <iframe
                src={`${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"}/public/widget/${agentId}`}
                title="Agent Chat Widget"
                className="w-full h-[520px]"
                allow="microphone"
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium">Embed code</div>
              <pre className="rounded-md border p-3 text-xs whitespace-pre-wrap break-words">{`<div style="position:relative;width:380px;height:600px;border-radius:12px;overflow:hidden;">
  <iframe
    src="${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"}/public/widget/${agentId}?apiKey=YOUR_API_KEY"
    style="width:100%;height:100%;border:none;"
    allow="microphone"
    title="AI Chat Assistant"
  ></iframe>
</div>`}</pre>
            </div>
          </div>
        </div>
      )}

      {currentTab === "knowledge" && (
        <div className="space-y-4">
          <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Knowledge Base</div>
                <div className="text-xs text-muted-foreground">Manage documents and files for this agent</div>
              </div>
              <Button onClick={() => router.push(`/dashboard/knowledge?agentId=${agentId}`)}>Open Knowledge</Button>
            </div>
          </div>
        </div>
      )}

      {currentTab === "analytics" && (
        <div className="space-y-4">
          <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Analytics</div>
                <div className="text-xs text-muted-foreground">Manage Analytics for this agent</div>
              </div>
              <Button onClick={() => router.push(`/dashboard/analytics?agentId=${agentId}`)}>Open Analytics </Button>
            </div>
          </div>
        </div>
      )}

      {currentTab === "chat" && (
        <div className="space-y-4">
          <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Chat with this agent</div>
                <div className="text-xs text-muted-foreground">Open the full chat experience</div>
              </div>
              <Button onClick={() => router.push(`/dashboard/chat?agentId=${agentId}`)}>Open Chat</Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  const res = await deleteAgent(agentId);
                  if (res.success) {
                    toast.success("Agent deleted");
                    router.push("/dashboard");
                  } else {
                    toast.error(res.message || "Failed to delete agent");
                  }
                } catch (e: any) {
                  toast.error(e?.response?.data?.message || e?.message || "Failed to delete agent");
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
