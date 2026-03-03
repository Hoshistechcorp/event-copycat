import { motion } from "framer-motion";
import { TrendingUp, Ticket, Eye, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  // Mock data for now since ticket sales are localStorage-based
  const stats = [
    { label: "Total Revenue", value: "₦0.00", change: "+0%", icon: <DollarSign className="h-4 w-4 text-primary" /> },
    { label: "Tickets Sold", value: "0", change: "+0%", icon: <Ticket className="h-4 w-4 text-primary" /> },
    { label: "Total Views", value: "0", change: "+0%", icon: <Eye className="h-4 w-4 text-primary" /> },
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
