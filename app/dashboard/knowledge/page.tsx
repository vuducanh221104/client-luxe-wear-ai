"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  listKnowledge,
  searchKnowledge,
  createKnowledge,
  deleteKnowledge,
  uploadFiles,
  getUploadProgress,
} from "@/services/knowledgeService";
import { listAgents } from "@/services/agentService";
import { useSearchParams } from "next/navigation";

export default function KnowledgePage() {
  const params = useSearchParams();
  const lockedAgentId = params.get("agentId");
  const [tab, setTab] = useState("list");

  // list state
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [agentFilter, setAgentFilter] = useState<string>(lockedAgentId ? lockedAgentId : "all");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<null | { id: string; title: string }>(null);

  // add (manual)
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metadata, setMetadata] = useState<string>("{}");
  const [agentId, setAgentId] = useState<string>(lockedAgentId || "none");
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  // upload
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await listAgents({ page: 1, pageSize: 100 });
        const data = res.data?.agents || res.data?.data?.agents || [];
        setAgents(data.map((a: any) => ({ id: a.id, name: a.name })));
      } catch {}
    };
    if (!lockedAgentId) loadAgents();
  }, [lockedAgentId]);

  const load = async () => {
    setLoading(true);
    try {
      let res;
      const agentParam = lockedAgentId ? lockedAgentId : agentFilter === "all" ? undefined : agentFilter;
      if (q.trim()) {
        res = await searchKnowledge({ query: q.trim(), limit: perPage, agentId: agentParam });
        const list = res.data?.results || res.results || [];
        setItems(list);
        setTotal(list.length);
      } else {
        res = await listKnowledge({ page, pageSize: perPage, agentId: agentParam });
        const list = res.data?.knowledge || res.data?.data?.knowledge || [];
        const pagination = res.data?.pagination || res.data?.data?.pagination;
        setItems(list);
        setTotal(pagination?.totalCount || list.length);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load knowledge");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, perPage, agentFilter, lockedAgentId]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 500);
    return () => clearTimeout(t);
  }, [q]);

  const onFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);
    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      if ((lockedAgentId || agentId) && (lockedAgentId || agentId) !== "none") form.append("agentId", (lockedAgentId as string) || agentId);
      const res = await uploadFiles(form);
      const sid = res.data?.sessionId || res.sessionId;
      setSessionId(sid);
      toast.success("Upload started");
      // poll progress
      const interval = setInterval(async () => {
        try {
          const p = await getUploadProgress(sid);
          const v = p.progress?.percent || p.data?.progress?.percent || 0;
          setProgress(v);
          if (v >= 100) {
            clearInterval(interval);
            setUploading(false);
            toast.success("Upload completed");
            setFiles([]);
            load();
          }
        } catch {
          // stop on error
          clearInterval(interval);
          setUploading(false);
        }
      }, 800);
    } catch (e: any) {
      setUploading(false);
      toast.error(e?.response?.data?.message || e?.message || "Upload failed");
    }
  };

  const handleCreate = async () => {
    // server doc indicates content is not accepted here; still include metadata/title
    setSubmitting(true);
    try {
      let meta: any = {};
      try { meta = metadata ? JSON.parse(metadata) : {}; } catch { toast.error("Metadata must be valid JSON"); setSubmitting(false); return; }
      const res = await createKnowledge({ title, metadata: meta, agentId: lockedAgentId ? lockedAgentId : (agentId !== "none" ? agentId : null) });
      if (res.success) {
        toast.success("Knowledge created");
        setTitle("");
        setContent("");
        setMetadata("{}");
        load();
        setTab("list");
      } else {
        toast.error(res.message || "Failed to create knowledge");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to create knowledge");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <TabsList>
            <TabsTrigger value="list">List Knowledge</TabsTrigger>
            <TabsTrigger value="add">Add Knowledge</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="list" className="space-y-4">
          {!lockedAgentId && (
            <div className="flex items-center gap-3">
              <Input className="flex-1" placeholder="Search (title, filename)" value={q} onChange={(e) => setQ(e.target.value)} />
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="All agents" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All agents</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(perPage)} onValueChange={(v) => { setPerPage(parseInt(v)); setPage(1); }}>
                <SelectTrigger className="w-[110px]"><SelectValue placeholder="Per page" /></SelectTrigger>
                <SelectContent>
                  {[10,20,30,50].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}/page</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="rounded-2xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs">
                <tr>
                  <th className="text-left p-3">Title</th>
                  <th className="text-left p-3">Agent</th>
                  <th className="text-left p-3">Preview</th>
                  <th className="text-left p-3">Created</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="p-3" colSpan={5}>Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td className="p-3 text-muted-foreground" colSpan={5}>No knowledge entries</td></tr>
                ) : (
                  items.map((k) => (
                    <tr key={k.id} className="border-t">
                      <td className="p-3 align-top">{k.title || k.fileName || "Untitled"}</td>
                      <td className="p-3 align-top">{k.agent?.name || k.agentId || "-"}</td>
                      <td className="p-3 align-top text-muted-foreground">{k.metadata?.content_preview || k.fileType || "-"}</td>
                      <td className="p-3 align-top">{new Date(k.createdAt || k.created_at).toLocaleString()}</td>
                      <td className="p-3 align-top text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast.info("Edit coming soon")}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setConfirmDelete({ id: k.id, title: k.title })}>Delete</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {Math.ceil(total / perPage) > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <span className="py-2 px-4 text-sm">{page} / {Math.ceil(total / perPage)}</span>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(Math.ceil(total / perPage), p + 1))} disabled={page >= Math.ceil(total / perPage)}>Next</Button>
            </div>
          )}

          <Dialog open={!!confirmDelete} onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete knowledge</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">Are you sure you want to delete {confirmDelete?.title || "this item"}?</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!confirmDelete) return;
                    try {
                      const res = await deleteKnowledge(confirmDelete.id);
                      if (res.success) {
                        toast.success("Knowledge deleted");
                        setConfirmDelete(null);
                        load();
                      } else {
                        toast.error(res.message || "Failed to delete");
                      }
                    } catch (e: any) {
                      toast.error(e?.response?.data?.message || e?.message || "Failed to delete");
                    }
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            </div>
            <div className="space-y-2">
              <Label>Agent {lockedAgentId ? "(locked)" : "(optional)"}</Label>
              {lockedAgentId ? (
                <Input value={lockedAgentId} readOnly />
              ) : (
                <Select value={agentId} onValueChange={setAgentId}>
                  <SelectTrigger><SelectValue placeholder="No agent" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No agent</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Content (optional)</Label>
            <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Large text content (optional)" />
          </div>
          <div className="space-y-2">
            <Label>Metadata (JSON)</Label>
            <Textarea rows={6} value={metadata} onChange={(e) => setMetadata(e.target.value)} placeholder='{"tags":["finance"],"source":"manual"}' />
            <div className="text-xs text-muted-foreground">Provide valid JSON. We store metadata; content is recommended via Upload for chunking.</div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCreate} disabled={submitting}>{submitting ? "Submitting..." : "Create"}</Button>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Files</Label>
              <Input type="file" multiple onChange={(e) => onFiles(e.target.files)} accept=".pdf,.doc,.docx,.txt,.md,.mdx" />
              {files.length > 0 && (
                <div className="rounded-md border p-3 text-sm">
                  <div className="font-medium mb-2">Selected files</div>
                  <ul className="list-disc pl-5">
                    {files.map((f, i) => (
                      <li key={i}>{f.name} ({Math.round(f.size / 1024)} KB)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Agent {lockedAgentId ? "(locked)" : "(optional)"}</Label>
              {lockedAgentId ? (
                <Input value={lockedAgentId} readOnly />
              ) : (
                <Select value={agentId} onValueChange={setAgentId}>
                  <SelectTrigger><SelectValue placeholder="No agent" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No agent</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Formats: PDF, DOCX, TXT, MD. Multiple files supported; processing continues if one fails.</div>
            <div className="h-2 w-full rounded bg-muted">
              <div className="h-2 rounded bg-primary" style={{ width: `${progress}%`, transition: "width .2s" }} />
            </div>
            <div className="text-xs text-muted-foreground">{uploading ? `Uploading... ${Math.floor(progress)}%` : progress > 0 ? `${Math.floor(progress)}%` : ""}</div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setFiles([]); setProgress(0); }}>Clear</Button>
            <Button onClick={handleUpload} disabled={uploading || files.length === 0}>{uploading ? "Uploading..." : "Upload"}</Button>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
