import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Plus, MapPin, Wallet, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";

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

const DashboardBento = ({ events, isHost }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const [grossRevenue, setGrossRevenue] = useState(0);
  const [last30, setLast30] = useState(0);
  const [prev30, setPrev30] = useState(0);

  useEffect(() => {
    if (!user || !isHost) return;
    const myEventIds = events.map((e) => e.id);
    if (myEventIds.length === 0) return;
    (async () => {
      const { data } = await supabase
        .from("ticket_purchases")
        .select("total_amount, created_at, event_id")
        .in("event_id", myEventIds);
      if (!data) return;
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      let gross = 0,
        l30 = 0,
        p30 = 0;
      for (const r of data) {
        const amt = Number(r.total_amount) || 0;
        gross += amt;
        const t = new Date(r.created_at).getTime();
        if (now - t <= 30 * day) l30 += amt;
        else if (now - t <= 60 * day) p30 += amt;
      }
      setGrossRevenue(gross);
      setLast30(l30);
      setPrev30(p30);
    })();
  }, [user, isHost, events]);

  const upcoming = events
    .filter((e) => e.status === "published" && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const featured = upcoming[0];

  // Top city by host's published events
  const cityCounts = new Map<string, number>();
  for (const e of events) {
    if (e.status !== "published") continue;
    const city = (e.venue || "").split(",").pop()?.trim() || e.venue;
    if (!city) continue;
    cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
  }
  const topCity = [...cityCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const projectedPayout = grossRevenue * 0.95; // host nets after 5% commission
  const deltaPct =
    prev30 > 0 ? Math.round(((last30 - prev30) / prev30) * 100) : last30 > 0 ? 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
      {/* Featured / hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-8 rounded-3xl glass-panel relative overflow-hidden min-h-[280px] lg:min-h-[340px] group"
      >
        {featured?.image_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${featured.image_url})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/10 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-7">
          {featured ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full glass-panel text-[10px] font-bold uppercase tracking-wider text-primary">
                  Next up
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(featured.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h3 className="text-xl sm:text-3xl font-extrabold text-foreground mb-1.5 leading-tight line-clamp-2">
                {featured.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 truncate">{featured.venue}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-xl btn-gradient-brand font-bold border-0"
                  onClick={() => navigate(`/events/${featured.id}`)}
                >
                  View event <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
                {isHost && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl font-bold"
                    onClick={() => navigate(`/edit-event/${featured.id}`)}
                  >
                    Manage
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full glass-panel text-[10px] font-bold uppercase tracking-wider text-primary mb-3 w-fit">
                <Calendar className="h-3 w-3" /> No events yet
              </div>
              <h3 className="text-xl sm:text-3xl font-extrabold text-foreground mb-1.5 leading-tight">
                {isHost ? "Launch your first experience" : "Find your next experience"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-md">
                {isHost
                  ? "Create an event in under 5 minutes — set tickets, share, sell out."
                  : "Discover what's happening near you and around the world."}
              </p>
              <Button
                size="sm"
                className="rounded-xl btn-gradient-brand font-bold border-0 w-fit"
                onClick={() => navigate(isHost ? "/create-event" : "/events")}
              >
                {isHost ? (
                  <>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Create event
                  </>
                ) : (
                  <>
                    Browse events <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Side stack */}
      <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-5">
        {/* Projected payout (host) / Tickets summary (attendee) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl glass-panel glass-active p-5 sm:p-6 relative overflow-hidden flex-1"
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            {isHost && deltaPct !== 0 && (
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  deltaPct >= 0 ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                }`}
              >
                {deltaPct >= 0 ? "+" : ""}
                {deltaPct}% MoM
              </span>
            )}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            {isHost ? "Projected payout" : "Spent on tickets"}
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {formatPrice(String(isHost ? projectedPayout : 0))}
          </p>
          <div className="divider-glow my-4" />
          <p className="text-xs text-muted-foreground">
            {isHost
              ? `Net after the 5% iBloov commission across ${events.length} event${events.length === 1 ? "" : "s"}.`
              : "Sign in and buy a ticket to see your spend here."}
          </p>
        </motion.div>

        {/* Top city / quick action */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate(isHost ? "/dashboard?tab=analytics" : "/events")}
          className="rounded-3xl glass-panel p-5 flex items-center gap-3 text-left hover:border-primary/40 transition-colors"
        >
          <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            {topCity ? (
              <MapPin className="h-5 w-5 text-primary" />
            ) : (
              <TrendingUp className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              {topCity ? "Your top city" : "Trending"}
            </p>
            <p className="text-sm font-extrabold text-foreground truncate">
              {topCity ? topCity[0] : "Discover what's hot"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {topCity
                ? `${topCity[1]} event${topCity[1] === 1 ? "" : "s"} published`
                : "Browse the global event feed"}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </motion.button>
      </div>
    </div>
  );
};

export default DashboardBento;
