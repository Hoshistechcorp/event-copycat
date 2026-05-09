import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Plus, Ticket, Megaphone, ArrowRight, Pin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuraLinks } from "@/hooks/useAuraLinks";
import { getProduct } from "@/lib/auraProducts";

interface EventLite {
  id: string;
  title: string;
  date: string;
  venue: string;
  image_url: string | null;
  status: string;
}

interface Props {
  events: EventLite[];
  isHost: boolean;
}

const DashboardHomeHero = ({ events, isHost }: Props) => {
  const navigate = useNavigate();
  const { pinnedIds } = useAuraLinks();
  const pinned = pinnedIds.map((id) => getProduct(id)).filter(Boolean);

  const upcoming = events
    .filter((e) => e.status === "published" && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const quickActions = isHost
    ? [
        { label: "Create Event", icon: <Plus className="h-4 w-4" />, action: () => navigate("/create-event") },
        { label: "Manage Tickets", icon: <Ticket className="h-4 w-4" />, action: () => navigate("/dashboard?tab=events") },
        { label: "Promote", icon: <Megaphone className="h-4 w-4" />, action: () => navigate("/dashboard?tab=promotions") },
      ]
    : [
        { label: "Find Events", icon: <Calendar className="h-4 w-4" />, action: () => navigate("/events") },
        { label: "My Tickets", icon: <Ticket className="h-4 w-4" />, action: () => navigate("/my-tickets") },
        { label: "Become a Host", icon: <Plus className="h-4 w-4" />, action: () => navigate("/profile?tab=account") },
      ];

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {quickActions.map((qa) => (
          <button
            key={qa.label}
            onClick={qa.action}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-3 sm:py-4 rounded-2xl bg-secondary/60 hover:bg-secondary transition-colors text-center sm:text-left active:scale-[0.98]"
          >
            <span className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {qa.icon}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">{qa.label}</span>
          </button>
        ))}
      </div>

      {/* Upcoming events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">Upcoming events</h3>
          <button
            onClick={() => navigate(isHost ? "/dashboard?tab=events" : "/events")}
            className="text-xs font-semibold text-primary inline-flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {upcoming.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="p-6 text-center">
              <Calendar className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {isHost ? "No upcoming events yet." : "You have no upcoming events booked."}
              </p>
              <Button
                size="sm"
                className="mt-3 rounded-xl"
                onClick={() => navigate(isHost ? "/create-event" : "/events")}
              >
                {isHost ? "Create your first event" : "Browse events"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.map((e, i) => (
              <motion.button
                key={e.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/events/${e.id}`)}
                className="text-left rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-colors"
              >
                <div className="aspect-[16/9] bg-secondary overflow-hidden">
                  {e.image_url ? (
                    <img src={e.image_url} alt={e.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Calendar className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-foreground truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {e.venue}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Pinned items */}
      {pinned.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Pinned products</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {pinned.map((p) => {
              const Icon = p!.icon;
              return (
                <button
                  key={p!.id}
                  onClick={() => navigate(p!.route)}
                  className={`flex items-center gap-2 h-10 px-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors ${p!.color}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold text-foreground">{p!.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHomeHero;
