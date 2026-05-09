import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Loader2, Globe, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface TicketRecord {
  id: string;
  event_id: string;
  buyer_name: string | null;
  buyer_email: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  discount_amount: number;
  qr_token: string;
  checked_in_at: string | null;
  created_at: string;
  events: { title: string; date: string; end_date: string | null; venue: string; venue_address: string | null; image_url: string | null; event_format: string; online_url: string | null; currency: string } | null;
  ticket_tiers: { name: string; description: string | null } | null;
}

const TicketDetail = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;
    (async () => {
      const { data } = await supabase
        .from("ticket_purchases")
        .select("*, events(title, date, end_date, venue, venue_address, image_url, event_format, online_url, currency), ticket_tiers(name, description)")
        .eq("id", ticketId)
        .maybeSingle();
      setTicket(data as any);
      setLoading(false);
    })();
  }, [ticketId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (!ticket || !ticket.events) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Ticket not found</h1>
          <Button asChild className="rounded-full"><Link to="/my-tickets">My Tickets</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const ev = ticket.events;
  const dt = new Date(ev.date);
  const qrPayload = JSON.stringify({ t: ticket.qr_token, e: ticket.event_id, p: ticket.id });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container px-4 md:px-8 py-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/my-tickets")}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="text-xl font-extrabold">Your Ticket</h1>
            <p className="text-xs text-muted-foreground">Order #{ticket.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="relative h-44">
            <img src={ev.image_url || "/placeholder.svg"} alt={ev.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary backdrop-blur border border-primary/20">
                {ticket.ticket_tiers?.name}
              </span>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <h2 className="text-xl font-extrabold mb-1">{ev.title}</h2>
            <p className="text-sm text-muted-foreground mb-5">Attendee: {ticket.buyer_name || ticket.buyer_email}</p>

            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold">{dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
                  <p className="text-[10px] text-muted-foreground">{dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                {ev.event_format === "online" ? <Globe className="w-4 h-4 text-primary shrink-0" /> : <MapPin className="w-4 h-4 text-primary shrink-0" />}
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{ev.event_format === "online" ? "Online" : ev.venue}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{ev.event_format === "online" ? "Stream link below" : ev.venue_address}</p>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-border my-5 relative">
              <div className="absolute -left-8 -top-3.5 w-7 h-7 rounded-full bg-background" />
              <div className="absolute -right-8 -top-3.5 w-7 h-7 rounded-full bg-background" />
            </div>

            <div className="flex flex-col items-center py-4">
              <div className="p-4 bg-white rounded-xl">
                <QRCodeSVG value={qrPayload} size={180} level="M" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">Show this QR at the entrance</p>
              {ticket.checked_in_at && <p className="text-xs text-primary font-bold mt-1">✓ Checked in</p>}
            </div>

            {ev.event_format !== "in_person" && ev.online_url && (
              <a href={ev.online_url} target="_blank" rel="noopener noreferrer"
                className="block mt-4 p-3 rounded-xl bg-primary/10 border border-primary/30 text-center text-sm font-bold text-primary hover:bg-primary/15 transition-colors">
                <Globe className="inline h-4 w-4 mr-1.5" /> Join Online Event
              </a>
            )}

            <div className="border-t-2 border-dashed border-border my-5 relative">
              <div className="absolute -left-8 -top-3.5 w-7 h-7 rounded-full bg-background" />
              <div className="absolute -right-8 -top-3.5 w-7 h-7 rounded-full bg-background" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Tier</span><span className="font-bold">{ticket.ticket_tiers?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Qty</span><span className="font-bold">{ticket.quantity}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Unit price</span><span className="font-bold">{ticket.unit_price === 0 ? "Free" : `${ev.currency} ${ticket.unit_price}`}</span></div>
              {ticket.discount_amount > 0 && <div className="flex justify-between text-primary"><span>Discount</span><span className="font-bold">−{ev.currency} {ticket.discount_amount}</span></div>}
              <div className="flex justify-between pt-2 border-t border-border"><span>Total paid</span><span className="font-extrabold text-primary">{ticket.total_amount === 0 ? "Free" : `${ev.currency} ${ticket.total_amount}`}</span></div>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1 rounded-xl" asChild><Link to={`/events/${ticket.event_id}`}>View event page</Link></Button>
          <Button variant="outline" className="rounded-xl" onClick={() => window.print()}><Download className="w-4 h-4 mr-1" /> Print</Button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TicketDetail;
