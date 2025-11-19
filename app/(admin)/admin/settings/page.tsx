'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, Tabs, Statistic, Row, Col, Tag, List } from 'antd';
import { getSystemAnalytics, getApiHealth } from '@/services/analyticsService';
import { adminListAllAgents } from '@/services/agentService';
import { toast } from 'sonner';

export default function AdminSystemSettingsPage() {
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [sys, hlth] = await Promise.all([
        getSystemAnalytics(),
        getApiHealth(),
      ]);
      const sysData = (sys as any)?.data || sys;
      const hlthData = (hlth as any)?.data || hlth;
      setStats(sysData);
      setHealth(hlthData);
      // Placeholder audit logs (backend endpoint not provided). Show last 10 agents as sample log entries
      try {
        const all = await adminListAllAgents({ page: 1, perPage: 10 });
        const payload = (all as any)?.data?.agents || (all as any)?.agents || [];
        setLogs(payload.map((a: any) => ({
          key: a.id,
          action: a.isPublic ? 'Agent made public' : 'Agent created',
          actor: a.owner?.email || 'system',
          target: a.name,
          timestamp: a.createdAt || a.created_at,
        })));
      } catch {}
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load system data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">System Settings</h1>
      <Card className="rounded-2xl border p-2">
        <Tabs
          items={[
            {
              key: 'stats',
              label: 'System stats',
              children: (
                <Row gutter={16}>
                  <Col span={6}><Statistic loading={loading} title="Total agents" value={stats?.totalAgents ?? '-'} /></Col>
                  <Col span={6}><Statistic loading={loading} title="Public agents" value={stats?.publicAgents ?? '-'} /></Col>
                  <Col span={6}><Statistic loading={loading} title="Total tenants" value={stats?.totalTenants ?? '-'} /></Col>
                  <Col span={6}><Statistic loading={loading} title="Active users" value={stats?.activeUsers ?? '-'} /></Col>
                </Row>
              ),
            },
            {
              key: 'health',
              label: 'System health',
              children: (
                <div className="space-y-3 text-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    {health?.success ? <Tag color="green">ok</Tag> : <Tag color="red">down</Tag>}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Message:</span> <span className="text-foreground">{health?.message || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timestamp:</span> <span className="text-foreground">{health?.timestamp || new Date().toISOString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uptime:</span> <span className="text-foreground">{health?.uptime ? `${Math.floor(health.uptime)}s` : '-'}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'rate',
              label: 'Rate limits',
              children: (
                <div className="space-y-2 text-sm text-foreground">
                  <div><span className="text-muted-foreground">Public chat limiter:</span> <span className="text-green-600 dark:text-green-400">enabled</span></div>
                  <div><span className="text-muted-foreground">Auth routes limiter:</span> <span className="text-green-600 dark:text-green-400">enabled</span></div>
                  <div><span className="text-muted-foreground">Strict AI chat limiter:</span> <span className="text-green-600 dark:text-green-400">enabled</span></div>
                  <div className="text-muted-foreground text-xs">(Hiển thị demo dựa trên middleware hiện có)</div>
                </div>
              ),
            },
            {
              key: 'flags',
              label: 'Feature flags',
              children: (
                <div className="space-y-2 text-sm text-foreground">
                  <div><span className="text-muted-foreground">RAG indexing v2:</span> <Tag color="blue">on</Tag></div>
                  <div><span className="text-muted-foreground">Experimental SSE:</span> <Tag>off</Tag></div>
                  <div><span className="text-muted-foreground">Multi-tenant beta:</span> <Tag color="blue">on</Tag></div>
                  <div className="text-muted-foreground text-xs">(Placeholder cho flags - cần backend nếu muốn bật/tắt)</div>
                </div>
              ),
            },
            {
              key: 'audit',
              label: 'Audit logs',
              children: (
                <List
                  loading={loading}
                  dataSource={logs}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${item.action} — ${item.target}`}
                        description={`${item.actor} • ${item.timestamp ? new Date(item.timestamp).toLocaleString() : '-'}`}
                      />
                    </List.Item>
                  )}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
