import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Ticket, Calendar, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PurchaseRow {
  id: string;
  event_id: string;
  ticket_tier_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at: string;
  events?: { title: string; date: string; venue: string; image_url: string | null; currency: string } | null;
  ticket_tiers?: { name: string } | null;
}

export interface PurchasedTicket {
  id: string;
  eventId: number | string;
  ticketType: string;
  price: string;
  quantity: number;
  purchasedAt: string;
  name: string;
  email: string;
}

const MyTickets = () => {
  const { user, loading: authLoading } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("ticket_purchases")
        .select("id, event_id, ticket_tier_id, quantity, unit_price, total_amount, created_at, events(title, date, venue, image_url, currency), ticket_tiers(name)")
        .eq("buyer_user_id", user.id)
        .order("created_at", { ascending: false });
      setPurchases((data as any) || []);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-20 text-center">
          <Ticket className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Sign in to view your tickets</h2>
          <Button className="rounded-full mt-3" asChild><Link to="/signin">Sign In</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container px-4 md:px-8 py-12 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link to="/events"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold">My Tickets</h1>
            <p className="text-sm text-muted-foreground">{purchases.length} ticket{purchases.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {purchases.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">No tickets yet</h2>
            <Button className="rounded-full mt-2" asChild><Link to="/events">Browse Events</Link></Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchases.map((p, i) => {
              const ev = p.events;
              const dt = ev ? new Date(ev.date) : null;
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/my-tickets/${p.id}`} className="block bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <img src={ev?.image_url || "/placeholder.svg"} alt={ev?.title} className="w-full h-36 object-cover" />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{p.ticket_tiers?.name}</span>
                        <span className="text-xs font-bold text-primary">{p.unit_price === 0 ? "Free" : `${ev?.currency || "USD"} ${p.unit_price}`}</span>
                      </div>
                      <h3 className="text-sm font-bold mb-2 line-clamp-1">{ev?.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Calendar className="w-3 h-3" />{dt?.toLocaleDateString()} · {dt?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{ev?.venue}</div>
                      <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Qty: {p.quantity}</span>
                        <span>{new Date(p.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default MyTickets;
