"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";
import { listAgents } from "@/services/agentService";
import { getUserAnalytics, getTenantAnalytics, exportAnalytics } from "@/services/analyticsService";

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export default function UsagePage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [loading, setLoading] = useState(false);
  
  // Summary data
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [agentsUsed, setAgentsUsed] = useState(0);
  
  // Chart data
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [creditsPerAgent, setCreditsPerAgent] = useState<any[]>([]);

  // Load agents
  useEffect(() => {
    listAgents({ page: 1, pageSize: 100 })
      .then((res) => {
        const raw = res?.data ?? res;
        const arr = Array.isArray(raw?.agents)
          ? raw.agents
          : Array.isArray(raw?.data?.agents)
          ? raw.data.agents
          : Array.isArray(raw)
          ? raw
          : [];
        setAgents(arr);
      })
      .catch((err) => console.error("Failed to load agents:", err));
  }, []);

  // Load analytics data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Determine period params
      let params: any = {};
      if (timeRange === "custom" && dateRange.from && dateRange.to) {
        params.startDate = format(dateRange.from, "yyyy-MM-dd");
        params.endDate = format(dateRange.to, "yyyy-MM-dd");
      } else if (timeRange !== "custom") {
        params.period = timeRange;
      }
      if (selectedAgent && selectedAgent !== "all") {
        params.agentId = selectedAgent;
      }

      // Get summary from user analytics
      const userAnalyticsRes = await getUserAnalytics(params);
      const userAnalytics = userAnalyticsRes?.data || userAnalyticsRes;
      
      // Map backend response to frontend state
      // Backend returns: totalQueries, uniqueAgents
      setCreditsUsed(userAnalytics?.totalQueries || 0);
      
      // Get number of agents created (from agents list)
      const agentsRes = await listAgents({ page: 1, pageSize: 100 });
      const rawAgents = agentsRes?.data ?? agentsRes;
      const agentsList = Array.isArray(rawAgents?.agents)
        ? rawAgents.agents
        : Array.isArray(rawAgents?.data?.agents)
        ? rawAgents.data.agents
        : Array.isArray(rawAgents)
        ? rawAgents
        : [];
      setAgentsUsed(agentsList.length || 0);

      // Get tenant analytics for charts
      const tenantAnalyticsRes = await getTenantAnalytics(params);
      const tenantAnalytics = tenantAnalyticsRes?.data || tenantAnalyticsRes;

      // Transform dailyStats (Record<string, number>) to usageOverTime array
      // Backend returns: dailyStats: { "2024-01-01": 5, "2024-01-02": 10, ... }
      const dailyStats = tenantAnalytics?.dailyStats || {};
      const usageData = Object.entries(dailyStats)
        .map(([date, count]) => ({
          date,
          credits: count as number,
        }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)); // Sort by date ascending
      setUsageHistory(usageData);

      // Transform topAgents to creditsPerAgent with agent names
      // Backend returns: topAgents: [{ agentId: "xxx", count: 5 }, ...]
      const topAgents = tenantAnalytics?.topAgents || [];
      const agentData = topAgents.map((item: any) => {
        const agent = agentsList.find((a: any) => a.id === item.agentId);
        return {
          agent: agent?.name || item.agentId || "Unknown",
          credits: item.count || 0,
        };
      });
      setCreditsPerAgent(agentData);

    } catch (error: any) {
      console.error("Failed to load analytics:", error);
      toast.error(error?.response?.data?.message || "Failed to load usage data");
    } finally {
      setLoading(false);
    }
  }, [timeRange, dateRange, selectedAgent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Export CSV
  const handleExport = async () => {
    try {
      // Build export params
      let params: any = { format: 'csv' };
      if (timeRange === "custom" && dateRange.from && dateRange.to) {
        params.startDate = format(dateRange.from, "yyyy-MM-dd");
        params.endDate = format(dateRange.to, "yyyy-MM-dd");
      } else if (timeRange !== "custom") {
        params.period = timeRange;
      }
      if (selectedAgent && selectedAgent !== "all") {
        params.agentId = selectedAgent;
      }

      const blob = await exportAnalytics(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `usage-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Exported successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to export");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usage Tracking</h1>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {(Array.isArray(agents) ? agents : []).map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        {timeRange === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[260px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{creditsUsed}</div>
            <div className="text-xs text-muted-foreground mt-1">/ 100 Total available</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agents Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agentsUsed}</div>
            <div className="text-xs text-muted-foreground mt-1">Active agents</div>
          </CardContent>
        </Card>
      </div>

      {/* Usage History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : usageHistory.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              No usage data available
            </div>
          ) : (
            <ChartContainer
              config={{
                credits: {
                  label: "Credits",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-64 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="credits" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Credits Per Agent Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Credits Used Per Agent</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : creditsPerAgent.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              No data available
            </div>
          ) : (
            <ChartContainer
              config={{
                credits: {
                  label: "Credits",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-64 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={creditsPerAgent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agent" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="credits" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Daily Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Usage Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : usageHistory.length === 0 ? (
            <div className="text-sm text-muted-foreground">No daily usage data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium text-right">Credits Used</th>
                  </tr>
                </thead>
                <tbody>
                  {usageHistory.slice(0, 10).map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{item.date}</td>
                      <td className="py-2 text-right">{item.credits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
