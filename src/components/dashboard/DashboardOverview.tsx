import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Ticket, Eye, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  delay: number;
}

const StatCard = ({ label, value, change, icon, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="rounded-2xl border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-extrabold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="text-green-500 font-semibold">{change}</span> vs last month
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

interface DashboardOverviewProps {
  totalEvents: number;
  publishedEvents: number;
}

const DashboardOverview = ({ totalEvents, publishedEvents }: DashboardOverviewProps) => {
  const { user } = useAuth();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchSales = async () => {
      const { data } = await supabase
        .from("ticket_purchases")
        .select("total_amount, quantity");
      if (data) {
        setTotalRevenue(data.reduce((sum, r) => sum + Number(r.total_amount), 0));
        setTicketsSold(data.reduce((sum, r) => sum + r.quantity, 0));
      }
    };
    fetchSales();
  }, [user]);

  const stats = [
    { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, change: "+12%", icon: <DollarSign className="h-4 w-4 text-primary" /> },
    { label: "Tickets Sold", value: String(ticketsSold), change: "+8%", icon: <Ticket className="h-4 w-4 text-primary" /> },
    { label: "Total Views", value: "1,247", change: "+23%", icon: <Eye className="h-4 w-4 text-primary" /> },
    { label: "Active Events", value: String(publishedEvents), change: `${totalEvents} total`, icon: <TrendingUp className="h-4 w-4 text-primary" /> },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} delay={i * 0.08} />
      ))}
    </div>
  );
};

export default DashboardOverview;
