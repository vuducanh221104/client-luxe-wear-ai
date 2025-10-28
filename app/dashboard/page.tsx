"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listAgents, searchAgents, deleteAgent, getAgent, createAgent } from "@/services/agentService";
import { MessageCircle, MoreVertical, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { chat } from "@/services/chatService";
import { useAppSelector } from "@/store";

export default function DashboardHomePage() {
  const router = useRouter();
  const currentTenant = useAppSelector((s) => s.tenant.currentTenant);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [perPage, setPerPage] = useState(12);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("created_at-DESC");
  const [confirmOpen, setConfirmOpen] = useState<null | { id: string; name: string }>(null);
  const [chatAgentId, setChatAgentId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const loadAgents = useCallback(async (q: string) => {
    if (!currentTenant) {
      setAgents([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      let res;
      if (q) {
        res = await searchAgents({ q, page, pageSize: perPage });
      } else {
        res = await listAgents({ page, pageSize: perPage });
      }
      let agentsData = res.data?.agents || res.data?.data?.agents || [];
      const pagination = res.data?.pagination || res.data?.data?.pagination;
      // client-side sorting to meet UI spec
      const [field, order] = sortBy.split("-");
      agentsData = [...agentsData].sort((a: any, b: any) => {
        const aName = a.name?.toLowerCase?.() || "";
        const bName = b.name?.toLowerCase?.() || "";
        const aCreated = new Date(a.createdAt || a.created_at || 0).getTime();
        const bCreated = new Date(b.createdAt || b.created_at || 0).getTime();
        if (field === "name") {
          return order === "ASC" ? aName.localeCompare(bName) : bName.localeCompare(aName);
        }
        // created_at default
        return order === "ASC" ? aCreated - bCreated : bCreated - aCreated;
      });
      setAgents(agentsData);
      setTotal(pagination?.totalCount || agentsData.length);
    } catch (e: any) {
      console.error("Failed to load agents:", e);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sortBy, currentTenant]);

  useEffect(() => {
    loadAgents(searchTerm);
  }, [page, sortBy, perPage, loadAgents, searchTerm, currentTenant]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (!searchTerm) setPage(1);
      loadAgents(searchTerm);
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, perPage, loadAgents]);

  const showTenantEmpty = !currentTenant;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Agents</h1>
        <Button onClick={() => router.push("/dashboard/agents/new")} disabled={!currentTenant}>
          <Plus className="mr-2 h-4 w-4" />
          New AI Agent
        </Button>
      </div>

      {showTenantEmpty ? (
        <div className="text-center py-12 border rounded-2xl">
          <p className="text-muted-foreground">Select or create a tenant workspace to view agents.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={() => router.push("/dashboard/tenants")}>Go to Tenants</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-DESC">Newest First</SelectItem>
                <SelectItem value="created_at-ASC">Oldest First</SelectItem>
                <SelectItem value="name-ASC">Name A-Z</SelectItem>
                <SelectItem value="name-DESC">Name Z-A</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(perPage)} onValueChange={(v) => { setPerPage(parseInt(v)); setPage(1); }}>
              <SelectTrigger className="w-[110px]"><SelectValue placeholder="Per page" /></SelectTrigger>
              <SelectContent>
                {[6,12,24,36].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}/page</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border overflow-hidden animate-pulse">
                  <div className="h-56 bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 border rounded-2xl">
              <p className="text-muted-foreground">No agents yet in this tenant</p>
              <Button className="mt-4" onClick={() => router.push("/dashboard/agents/new")}>
                Create your first agent
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {agents.map((agent) => (
                  <div key={agent.id} className="rounded-2xl border overflow-hidden group">
                    <div
                      className="h-56 bg-gradient-to-r cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${agent.gradient_color || "#4F46E5"} 0%, ${agent.gradient_color_end || "#7C3AED"} 100%)`,
                      }}
                      onClick={() => router.push(`/dashboard/agents/${agent.id}`)}
                    >
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="font-semibold">{agent.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{agent.description || "No description"}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(() => {
                            const raw = agent.createdAt || agent.created_at;
                            const d = raw ? new Date(raw) : null;
                            const valid = d && !isNaN(d.getTime());
                            return `Created ${valid ? d!.toLocaleString() : "N/A"}`;
                          })()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChatAgentId(agent.id);
                            setChatMessages([]);
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/agents/${agent.id}`)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                              try {
                                const res = await getAgent(agent.id);
                                const data = res.data || res;
                                const payload = {
                                  name: `${data.name || agent.name} Copy`,
                                  description: data.description || agent.description,
                                  config: data.config || agent.config,
                                } as any;
                                const created = await createAgent(payload);
                                if (created.success) {
                                  toast.success("Agent duplicated");
                                  loadAgents(searchTerm);
                                } else {
                                  toast.error(created.message || "Failed to duplicate");
                                }
                              } catch (e: any) {
                                toast.error(e?.response?.data?.message || e?.message || "Failed to duplicate");
                              }
                            }}>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => setConfirmOpen({ id: agent.id, name: agent.name })}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {Math.ceil(total / perPage) > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="py-2 px-4">{page} / {Math.ceil(total / perPage)}</span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(Math.ceil(total / perPage), p + 1))}
                    disabled={page >= Math.ceil(total / perPage)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <Dialog open={!!confirmOpen} onOpenChange={(o) => { if (!o) setConfirmOpen(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete agent</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete {confirmOpen?.name}? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirmOpen) return;
                try {
                  const res = await deleteAgent(confirmOpen.id);
                  if (res.success) {
                    toast.success("Agent deleted");
                    setConfirmOpen(null);
                    // reload current page
                    loadAgents(searchTerm);
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

      <Dialog open={!!chatAgentId} onOpenChange={(o) => { if (!o) { setChatAgentId(null); setChatMessages([]); } }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Quick chat</DialogTitle>
          </DialogHeader>
          <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-3 bg-muted/30">
            {chatMessages.length === 0 && (
              <p className="text-xs text-muted-foreground">Start a quick conversation with this agent.</p>
            )}
            {chatMessages.map((m, idx) => (
              <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                <span className="inline-block text-sm px-3 py-2 rounded-lg bg-white shadow-sm">
                  {m.content}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Textarea rows={3} value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setChatInput("")}>Clear</Button>
              <Button
                onClick={async () => {
                  if (!chatAgentId || !chatInput.trim()) return;
                  const msg = chatInput.trim();
                  setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
                  setChatInput("");
                  setChatLoading(true);
                  try {
                    const res = await chat(chatAgentId, { message: msg });
                    const reply = res.data?.response || res.data?.message || "(no response)";
                    setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message || e?.message || "Chat failed");
                  } finally {
                    setChatLoading(false);
                  }
                }}
                disabled={chatLoading}
              >
                {chatLoading ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
