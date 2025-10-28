'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, Tag, Space, Select as AntSelect } from 'antd';
import { adminListAllAgents, adminForceDeleteAgent } from '@/services/agentService';
import { toast } from 'sonner';

export default function AdminAgentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [pubFilter, setPubFilter] = useState<'all' | 'public' | 'private'>('all');
  const [sortKey, setSortKey] = useState<'created_desc' | 'created_asc' | 'name_asc' | 'name_desc'>('created_desc');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminListAllAgents({ page, perPage });
      const body = (res as any)?.data || res;
      const payload = body?.data || body;
      const agents = payload?.agents || body?.agents || [];
      const pagination = payload?.pagination || body?.pagination || { total: agents.length };
      setData(agents);
      setTotal(pagination.total || agents.length);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, perPage]);

  const filtered = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((a) => (a.name || '').toLowerCase().includes(q) || (a.owner?.email || '').toLowerCase().includes(q));
    }
    if (pubFilter !== 'all') {
      list = list.filter((a) => (pubFilter === 'public' ? a.isPublic : !a.isPublic));
    }
    switch (sortKey) {
      case 'created_asc':
        list.sort((a, b) => new Date(a.createdAt || a.created_at).getTime() - new Date(b.createdAt || b.created_at).getTime());
        break;
      case 'name_asc':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
        list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default:
        list.sort((a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime());
    }
    return list;
  }, [data, query, pubFilter, sortKey]);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Owner', dataIndex: ['owner','email'], key: 'owner', render: (_: any, r: any) => r.owner?.email || '-' },
    { title: 'Public', dataIndex: 'isPublic', key: 'isPublic', render: (v: boolean) => v ? <Tag color="green">public</Tag> : <Tag>private</Tag> },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (_: any, r: any) => {
        const d = r.createdAt || r.created_at;
        return d ? new Date(d).toLocaleString() : '-';
      } },
    { title: 'Actions', key: 'actions', fixed: 'right' as const, render: (_: any, r: any) => (
        <Space>
          <Button variant="destructive" size="sm" onClick={async () => {
            if (!confirm(`Force delete agent "${r.name}"? This cannot be undone.`)) return;
            try {
              await adminForceDeleteAgent(r.id);
              toast.success('Agent deleted');
              load();
            } catch (e: any) {
              toast.error(e?.response?.data?.message || 'Failed to delete agent');
            }
          }}>Force delete</Button>
        </Space>
      ) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Agents</h1>
        <div className="flex gap-2">
          <Input placeholder="Search name/owner email" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
          <AntSelect value={pubFilter} onChange={(v) => setPubFilter(v)} style={{ width: 140 }} options={[
            { value: 'all', label: 'All' },
            { value: 'public', label: 'Public' },
            { value: 'private', label: 'Private' },
          ]} />
          <AntSelect value={sortKey} onChange={(v) => setSortKey(v)} style={{ width: 170 }} options={[
            { value: 'created_desc', label: 'Created ↓' },
            { value: 'created_asc', label: 'Created ↑' },
            { value: 'name_asc', label: 'Name A-Z' },
            { value: 'name_desc', label: 'Name Z-A' },
          ]} />
        </div>
      </div>

      <Card className="rounded-2xl border p-2">
        <Table
          rowKey="id"
          size="middle"
          columns={columns as any}
          dataSource={filtered}
          loading={loading}
          pagination={{ current: page, pageSize: perPage, total, showSizeChanger: false, onChange: (p) => setPage(p) }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
