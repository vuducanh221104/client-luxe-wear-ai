"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingGrid } from "@/components/shared/LoadingGrid";
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">AI Agents</h1>
        <Button onClick={() => router.push("/dashboard/agents/new")} disabled={!currentTenant} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Tạo AI Agent mới
        </Button>
      </div>

      {showTenantEmpty ? (
        <EmptyState
          title="Bạn chưa chọn workspace nào"
          description="Chọn hoặc tạo workspace tenant để xem và quản lý AI agents của bạn."
          actionLabel="Đi đến Tenants"
          onAction={() => router.push("/dashboard/tenants")}
        />
      ) : (
        <>
          <div className="flex gap-3">
            <Input
              placeholder="Tìm kiếm agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-DESC">Mới nhất trước</SelectItem>
                <SelectItem value="created_at-ASC">Cũ nhất trước</SelectItem>
                <SelectItem value="name-ASC">Tên A-Z</SelectItem>
                <SelectItem value="name-DESC">Tên Z-A</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(perPage)} onValueChange={(v) => { setPerPage(parseInt(v)); setPage(1); }}>
              <SelectTrigger className="w-[110px]"><SelectValue placeholder="Mỗi trang" /></SelectTrigger>
              <SelectContent>
                {[6,12,24,36].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}/trang</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <LoadingGrid />
          ) : agents.length === 0 ? (
            <EmptyState
              title="Chưa có agent nào trong tenant này"
              description="Tạo AI Agent đầu tiên để bắt đầu phục vụ khách hàng với LuxeWear."
              actionLabel="Tạo agent đầu tiên của bạn"
              onAction={() => router.push("/dashboard/agents/new")}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {agents.map((agent) => (
                  <div key={agent.id} className="rounded-2xl border overflow-hidden group hover:shadow-lg transition-all duration-300 hover:border-foreground/20">
                    <div
                      className="h-56 bg-gradient-to-r cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg, ${agent.gradient_color || "#4F46E5"} 0%, ${agent.gradient_color_end || "#7C3AED"} 100%)`,
                      }}
                      onClick={() => router.push(`/dashboard/agents/${agent.id}`)}
                    >
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1 truncate">{agent.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">{agent.description || "Không có mô tả"}</p>
                        <p className="text-xs text-muted-foreground">
                          {(() => {
                            const raw = agent.createdAt || agent.created_at;
                            const d = raw ? new Date(raw) : null;
                            const valid = d && !isNaN(d.getTime());
                            return `Đã tạo ${valid ? d!.toLocaleString('vi-VN') : "N/A"}`;
                          })()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-muted"
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
                            <Button variant="ghost" size="icon" className="hover:bg-muted">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/agents/${agent.id}`)}>Chỉnh sửa</DropdownMenuItem>
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
                                  toast.success("Đã sao chép agent");
                                  loadAgents(searchTerm);
                                } else {
                                  toast.error(created.message || "Sao chép thất bại");
                                }
                              } catch (e: any) {
                                toast.error(e?.response?.data?.message || e?.message || "Sao chép thất bại");
                              }
                            }}>Sao chép</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => setConfirmOpen({ id: agent.id, name: agent.name })}>Xóa</DropdownMenuItem>
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
                    Trước
                  </Button>
                  <span className="py-2 px-4">{page} / {Math.ceil(total / perPage)}</span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(Math.ceil(total / perPage), p + 1))}
                    disabled={page >= Math.ceil(total / perPage)}
                  >
                    Sau
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
            <DialogTitle>Xóa agent</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Bạn có chắc chắn muốn xóa {confirmOpen?.name}? Hành động này không thể hoàn tác.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(null)}>Hủy</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirmOpen) return;
                try {
                  const res = await deleteAgent(confirmOpen.id);
                  if (res.success) {
                    toast.success("Đã xóa agent");
                    setConfirmOpen(null);
                    // reload current page
                    loadAgents(searchTerm);
                  } else {
                    toast.error(res.message || "Xóa agent thất bại");
                  }
                } catch (e: any) {
                  toast.error(e?.response?.data?.message || e?.message || "Xóa agent thất bại");
                }
              }}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!chatAgentId} onOpenChange={(o) => { if (!o) { setChatAgentId(null); setChatMessages([]); } }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Trò chuyện nhanh</DialogTitle>
          </DialogHeader>
          <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-3 bg-muted/30">
            {chatMessages.length === 0 && (
              <p className="text-xs text-muted-foreground">Bắt đầu cuộc trò chuyện nhanh với agent này.</p>
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
            <Textarea rows={3} value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Nhập tin nhắn..." />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setChatInput("")}>Xóa</Button>
              <Button
                onClick={async () => {
                  if (!chatAgentId || !chatInput.trim()) return;
                  const msg = chatInput.trim();
                  setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
                  setChatInput("");
                  setChatLoading(true);
                  try {
                    const res = await chat(chatAgentId, { message: msg });
                    const reply = res.data?.response || res.data?.message || "(không có phản hồi)";
                    setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message || e?.message || "Trò chuyện thất bại");
                  } finally {
                    setChatLoading(false);
                  }
                }}
                disabled={chatLoading}
              >
                {chatLoading ? "Đang gửi..." : "Gửi"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
