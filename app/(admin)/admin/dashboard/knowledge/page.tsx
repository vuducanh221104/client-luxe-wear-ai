'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, Tag, Space } from 'antd';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminListAllKnowledge, adminGetKnowledgeStats, adminForceDeleteKnowledge, getKnowledge } from '@/services/knowledgeService';
import { toast } from 'sonner';
import { 
  Eye, 
  Trash2, 
  RefreshCw, 
  Database,
  Search,
  FileText
} from 'lucide-react';

export default function AdminKnowledgePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [selectedKnowledge, setSelectedKnowledge] = useState<any | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [knowledgeRes, statsRes] = await Promise.all([
        adminListAllKnowledge({ 
          page, 
          perPage,
          agentId: agentFilter !== 'all' ? agentFilter : undefined,
        }),
        adminGetKnowledgeStats().catch(() => null),
      ]);

      const body = (knowledgeRes as any)?.data || knowledgeRes;
      const payload = body?.data || body;
      const knowledge = payload?.knowledge || payload?.entries || Array.isArray(payload) ? payload : [];
      const pagination = payload?.pagination || body?.pagination || { total: knowledge.length };
      
      setData(Array.isArray(knowledge) ? knowledge : []);
      setTotal(pagination.total || pagination.totalCount || knowledge.length);
      setStats((statsRes as any)?.data || statsRes);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load knowledge');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, perPage, agentFilter]);

  const handleViewKnowledge = async (item: any) => {
    setSelectedKnowledge(item);
    setViewOpen(true);
    try {
      const detail = await getKnowledge(item.id);
      const detailData = (detail as any)?.data || detail;
      setSelectedKnowledge({ ...item, ...detailData });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load knowledge details');
    }
  };

  const filtered = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((k) => 
        (k.title || '').toLowerCase().includes(q) || 
        (k.content || '').toLowerCase().includes(q) ||
        (k.agent?.name || '').toLowerCase().includes(q) ||
        (k.user?.email || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, query]);

  const columns = [
    { 
      title: 'Title', 
      dataIndex: 'title', 
      key: 'title',
      render: (_: any, r: any) => (
        <div>
          <div className="font-medium">{r.title || '(No title)'}</div>
          {r.content && (
            <div className="text-xs text-muted-foreground truncate max-w-[400px]">
              {String(r.content).substring(0, 100)}...
            </div>
          )}
        </div>
      ),
    },
    { 
      title: 'Agent', 
      dataIndex: ['agent', 'name'], 
      key: 'agent', 
      render: (_: any, r: any) => r.agent?.name || '-' 
    },
    { 
      title: 'User', 
      dataIndex: ['user', 'email'], 
      key: 'user', 
      render: (_: any, r: any) => r.user?.email || '-' 
    },
    { 
      title: 'Tenant', 
      dataIndex: ['tenant', 'name'], 
      key: 'tenant', 
      render: (_: any, r: any) => r.tenant?.name || '-' 
    },
    { 
      title: 'Created', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      render: (_: any, r: any) => {
        const d = r.createdAt || r.created_at;
        return d ? (
          <div>
            <div className="text-sm">{new Date(d).toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">{new Date(d).toLocaleTimeString()}</div>
          </div>
        ) : '-';
      } 
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      fixed: 'right' as const, 
      render: (_: any, r: any) => (
        <Space>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleViewKnowledge(r)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={async () => {
              if (!confirm(`Force delete knowledge entry "${r.title || r.id}"? This cannot be undone.`)) return;
              try {
                await adminForceDeleteKnowledge(r.id);
                toast.success('Knowledge deleted');
                load();
              } catch (e: any) {
                toast.error(e?.response?.data?.message || 'Failed to delete knowledge');
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </Space>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Management</h1>
          <p className="text-muted-foreground mt-1">Manage all knowledge entries in the system</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold mt-1">{stats.totalEntries || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">By Agent</p>
                <p className="text-2xl font-bold mt-1">{stats.byAgent || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">By User</p>
                <p className="text-2xl font-bold mt-1">{stats.byUser || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage Usage</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.storageUsage ? `${(stats.storageUsage / 1024 / 1024).toFixed(2)} MB` : '0 MB'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title, content, agent, or user" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="pl-10" 
            />
          </div>
          <Select value={agentFilter} onValueChange={(v) => { setAgentFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {/* Agent options would be loaded from API */}
            </SelectContent>
          </Select>
          <Select value={String(perPage)} onValueChange={(v) => { setPerPage(parseInt(v)); setPage(1); }}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}/page</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Knowledge Table */}
      <Card className="rounded-2xl border overflow-x-auto p-2">
        <Table
          rowKey="id"
          size="middle"
          columns={columns as any}
          dataSource={filtered}
          loading={loading}
          pagination={{ 
            current: page, 
            pageSize: perPage, 
            total: filtered.length, 
            showSizeChanger: false, 
            onChange: (p) => setPage(p) 
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* View Knowledge Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Knowledge Entry Details</DialogTitle>
          </DialogHeader>
          {selectedKnowledge && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <span className="font-medium text-muted-foreground">Title:</span>
                    <p className="mt-1">{selectedKnowledge.title || '(No title)'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Agent:</span>
                    <p className="mt-1">{selectedKnowledge.agent?.name || '-'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">User:</span>
                    <p className="mt-1">{selectedKnowledge.user?.email || '-'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Tenant:</span>
                    <p className="mt-1">{selectedKnowledge.tenant?.name || '-'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Created:</span>
                    <p className="mt-1">
                      {selectedKnowledge.createdAt || selectedKnowledge.created_at
                        ? new Date(selectedKnowledge.createdAt || selectedKnowledge.created_at).toLocaleString()
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              {selectedKnowledge.content && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Content</h3>
                  <div className="p-3 rounded-lg border bg-muted/40 text-sm max-h-[300px] overflow-y-auto">
                    {selectedKnowledge.content}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedKnowledge.metadata && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Metadata</h3>
                  <pre className="p-3 rounded-lg border bg-muted/40 text-xs overflow-x-auto">
                    {JSON.stringify(selectedKnowledge.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
            {selectedKnowledge && (
              <Button 
                variant="destructive" 
                onClick={async () => {
                  if (!confirm(`Force delete knowledge entry "${selectedKnowledge.title || selectedKnowledge.id}"? This cannot be undone.`)) return;
                  try {
                    await adminForceDeleteKnowledge(selectedKnowledge.id);
                    toast.success('Knowledge deleted');
                    setViewOpen(false);
                    load();
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message || 'Failed to delete knowledge');
                  }
                }}
              >
                Force Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

