import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, Plus, LayoutDashboard, BarChart3, Wallet, Megaphone, CalendarDays } from "lucide-react";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";
import DashboardWallet from "@/components/dashboard/DashboardWallet";
import DashboardPromotions from "@/components/dashboard/DashboardPromotions";
import DashboardEventsList from "@/components/dashboard/DashboardEventsList";

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  status: string;
  image_url: string | null;
  created_at: string;
}

type Tab = "overview" | "events" | "analytics" | "wallet" | "promotions";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "events", label: "My Events", icon: <CalendarDays className="h-4 w-4" /> },
  { key: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { key: "wallet", label: "Wallet", icon: <Wallet className="h-4 w-4" /> },
  { key: "promotions", label: "Promote", icon: <Megaphone className="h-4 w-4" /> },
];

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("id, title, date, venue, category, status, image_url, created_at")
      .eq("host_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/signin");
    return null;
  }

  const publishedCount = events.filter((e) => e.status === "published").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero header */}
      <div className="hero-gradient border-b border-border">
        <div className="container max-w-6xl px-4 py-10 md:py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
                  Creator Dashboard
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage events, track sales, and grow your audience.
                </p>
              </div>
              <Button className="rounded-xl font-bold" onClick={() => navigate("/create-event")}>
                <Plus className="h-4 w-4 mr-2" /> Create Event
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-6xl px-4 py-6">
        {/* Tab navigation */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === "overview" && (
            <div className="space-y-8">
              <DashboardOverview totalEvents={events.length} publishedEvents={publishedCount} />
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Recent Events</h2>
                <DashboardEventsList events={events.slice(0, 5)} loading={loading} onEventsChange={setEvents} />
              </div>
            </div>
          )}
          {activeTab === "events" && (
            <DashboardEventsList events={events} loading={loading} onEventsChange={setEvents} />
          )}
          {activeTab === "analytics" && <DashboardAnalytics />}
          {activeTab === "wallet" && <DashboardWallet />}
          {activeTab === "promotions" && <DashboardPromotions events={events} />}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
