"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { listAgents } from "@/services/agentService";
import { getAgentAnalytics, getTenantAnalytics, exportAnalytics, getUserAnalytics } from "@/services/analyticsService";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import dynamic from "next/dynamic";

const AnalyticsCharts = dynamic(
  () => import("@/components/analytics/AnalyticsCharts"),
  {
    ssr: false,
    loading: () => (
      <LoadingSkeleton label="Đang tải biểu đồ analytics..." count={3} />
    ),
  },
);

export default function AnalyticsDashboardPage() {
  const params = useSearchParams();
  const lockedAgentId = params.get("agentId");
  const [agentId, setAgentId] = useState<string>(lockedAgentId || "all");
  const [range, setRange] = useState<string>("7d");
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);

  const [summary, setSummary] = useState<{ creditsUsed: number; agentsUsed: number }>({ creditsUsed: 0, agentsUsed: 0 });
  const [usageSeries, setUsageSeries] = useState<Array<{ date: string; value: number }>>([]);
  const [creditsPerAgent, setCreditsPerAgent] = useState<Array<{ name: string; value: number }>>([]);
  const [conversationsByAgent, setConversationsByAgent] = useState<Array<{ name: string; value: number }>>([]);
  const [recentQueries, setRecentQueries] = useState<Array<{ id: string; agent: string; query: string; response: string; timestamp: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await listAgents({ page: 1, pageSize: 100 });
        const data = res.data?.agents || res.data?.data?.agents || [];
        setAgents([{ id: "all", name: "All agents" }, ...data.map((a: any) => ({ id: a.id, name: a.name }))]);
        if (lockedAgentId && data.some((a: any) => a.id === lockedAgentId)) setAgentId(lockedAgentId);
      } catch {}
    };
    if (!lockedAgentId) loadAgents();
  }, [params, lockedAgentId]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nf = (id: string) => {
        const a = agents.find((x) => x.id === id);
        return a ? a.name : id;
      };
      // User summary
      const user = await getUserAnalytics();
      const u = user?.data || user;
      const creditsUsed = Number(u?.totalQueries ?? 0);
      const agentsUsed = Number(u?.uniqueAgents ?? 0);
      setSummary({ creditsUsed, agentsUsed });

      // Tenant analytics for charts
      const tenant = await getTenantAnalytics({ period: range });
      const t = tenant?.data || tenant;

      // usage over time from dailyStats
      const ds: Record<string, number> = t?.dailyStats || {};
      const series = Object.entries(ds)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => (a.date < b.date ? -1 : 1));
      setUsageSeries(series);

      const topAgents: Array<{ agentId: string; count: number }> = t?.topAgents || [];
      const perAgent = topAgents.map((x) => ({ name: nf(x.agentId), value: x.count }));
      setCreditsPerAgent(perAgent);
      setConversationsByAgent(perAgent);

      setRecentQueries(t?.recentQueries || u?.recentQueries || []);

      const effectiveAgentId = lockedAgentId || (agentId !== "all" ? agentId : "");
      if (effectiveAgentId) {
        const ag = await getAgentAnalytics(effectiveAgentId);
        const a = ag?.data || ag;
        setRecentQueries(a?.recentQueries || []);
        const single = [{ name: nf(effectiveAgentId), value: Number(a?.totalQueries ?? 0) }];
        setCreditsPerAgent(single);
        setConversationsByAgent(single);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load analytics";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [agentId, range, agents, lockedAgentId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExport = async () => {
    try {
      const blob = await exportAnalytics(lockedAgentId ? { agentId: lockedAgentId } : undefined);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Export failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-3">
          {!lockedAgentId && (
            <>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="All agents" /></SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="7d" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          <Button variant="outline" onClick={handleExport}>Export CSV</Button>
        </div>
      </div>

      {loading && !usageSeries.length && !creditsPerAgent.length ? (
        <LoadingSkeleton label="Đang tải dữ liệu thống kê..." count={3} />
      ) : error ? (
        <ErrorState
          title="Không thể tải dữ liệu analytics"
          description={error}
          onAction={loadAnalytics}
          actionLabel="Thử tải lại"
        />
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{summary.creditsUsed.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Credits used</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{summary.agentsUsed.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Agents used</div>
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts
        usageSeries={usageSeries}
        conversationsByAgent={conversationsByAgent}
        creditsPerAgent={creditsPerAgent}
        recentQueries={recentQueries}
      />
      </>
      )}
    </div>
  );
}
