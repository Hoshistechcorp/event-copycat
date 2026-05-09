import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Download, Filter, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const allRevenueData = [
  { month: "Jan", revenue: 0 }, { month: "Feb", revenue: 0 }, { month: "Mar", revenue: 0 },
  { month: "Apr", revenue: 0 }, { month: "May", revenue: 0 }, { month: "Jun", revenue: 0 },
  { month: "Jul", revenue: 0 }, { month: "Aug", revenue: 0 }, { month: "Sep", revenue: 0 },
  { month: "Oct", revenue: 0 }, { month: "Nov", revenue: 0 }, { month: "Dec", revenue: 0 },
];

const allTicketData = [
  { month: "Jan", sold: 0 }, { month: "Feb", sold: 0 }, { month: "Mar", sold: 0 },
  { month: "Apr", sold: 0 }, { month: "May", sold: 0 }, { month: "Jun", sold: 0 },
  { month: "Jul", sold: 0 }, { month: "Aug", sold: 0 }, { month: "Sep", sold: 0 },
  { month: "Oct", sold: 0 }, { month: "Nov", sold: 0 }, { month: "Dec", sold: 0 },
];

const categoryData = [
  { name: "Music", value: 40, color: "hsl(228, 65%, 55%)" },
  { name: "Parties", value: 30, color: "hsl(38, 95%, 55%)" },
  { name: "Workshops", value: 20, color: "hsl(160, 60%, 45%)" },
  { name: "Other", value: 10, color: "hsl(220, 15%, 70%)" },
];

const DashboardAnalytics = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "12m" | "custom">("12m");
  const [category, setCategory] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter data based on dateRange
  const getFilteredData = () => {
    const monthMap: Record<string, number> = { "7d": 1, "30d": 1, "90d": 3, "12m": 12, custom: 12 };
    const months = monthMap[dateRange] || 12;
    return {
      revenue: allRevenueData.slice(0, months),
      tickets: allTicketData.slice(0, months),
    };
  };

  const filtered = getFilteredData();

  const exportToCSV = () => {
    const headers = ["Month", `Revenue (${currency.code})`, "Tickets Sold"];
    const rows = filtered.revenue.map((r, i) => [r.month, r.revenue, filtered.tickets[i]?.sold ?? 0]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${category}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report exported", description: "CSV file downloaded successfully." });
  };

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <Card className="rounded-2xl border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Filter className="h-4 w-4 text-primary" />
              Filters
            </div>

            <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
              <SelectTrigger className="w-[140px] h-9 rounded-xl text-xs bg-secondary border-border">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[130px] h-9 rounded-xl text-xs bg-secondary border-border">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="parties">Parties</SelectItem>
                <SelectItem value="workshops">Workshops</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === "custom" && (
              <>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[140px] h-9 rounded-xl text-xs bg-secondary border-border" />
                <span className="text-xs text-muted-foreground">to</span>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[140px] h-9 rounded-xl text-xs bg-secondary border-border" />
              </>
            )}

            <div className="ml-auto">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-2 h-9" onClick={exportToCSV}>
                <Download className="h-3.5 w-3.5" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">Revenue Overview</CardTitle>
              <p className="text-xs text-muted-foreground">Monthly revenue from ticket sales</p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filtered.revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: "12px" }} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tickets Sold Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">Tickets Sold</CardTitle>
              <p className="text-xs text-muted-foreground">Monthly ticket sales trend</p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filtered.tickets}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="sold" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Distribution */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground">Event Categories</CardTitle>
            <p className="text-xs text-muted-foreground">Distribution of your events by category</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-muted-foreground">{cat.name} ({cat.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardAnalytics;
