import { useParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BadgeCheck, MapPin, Calendar, Clock, Users, ArrowLeft, Share2, Heart, Check, Music, Loader2, Globe, Lock, EyeOff, FlaskConical, ShieldCheck, Handshake, Heart as HeartIcon, Copy, ExternalLink, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutModal from "@/components/CheckoutModal";
import RsvpDialog from "@/components/RsvpDialog";
import { allEvents } from "@/data/events";
import { useDbEvent } from "@/hooks/useDbEvents";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const isDbId = id ? isUuid(id) : false;
  const { data: dbEvent, isLoading } = useDbEvent(isDbId ? id! : "");

  const event: any = useMemo(() => {
    if (isDbId) return dbEvent || null;
    return allEvents.find((e) => e.id === Number(id)) || null;
  }, [id, isDbId, dbEvent]);

  const [selectedTicket, setSelectedTicket] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const [hasRsvp, setHasRsvp] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [sponsorOpen, setSponsorOpen] = useState(false);

  useEffect(() => {
    if (!user || !isDbId) return;
    (async () => {
      const [{ data: tix }, { data: rsvp }] = await Promise.all([
        supabase.from("ticket_purchases").select("id").eq("event_id", id!).eq("buyer_user_id", user.id).limit(1),
        supabase.from("rsvps").select("id").eq("event_id", id!).eq("user_id", user.id).limit(1),
      ]);
      setHasTicket((tix?.length || 0) > 0);
      setHasRsvp((rsvp?.length || 0) > 0);
    })();
  }, [user, id, isDbId]);

  if (isLoading && isDbId) {
    return <div className="min-h-screen bg-background"><Navbar /><div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div><Footer /></div>;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Button asChild className="rounded-full"><Link to="/events">Browse Events</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Location reveal logic (only for DB events)
  const eventDate = event.date_iso ? new Date(event.date_iso) : null;
  const reveal: string = event.location_reveal || "always";
  const hoursToEvent = eventDate ? (eventDate.getTime() - Date.now()) / 3600000 : 0;
  const isHost = user && event.host_id && user.id === event.host_id;
  const showLocation =
    !isDbId || isHost || reveal === "always" ||
    (reveal === "on_rsvp" && (hasTicket || hasRsvp)) ||
    (reveal === "hours_before" && hoursToEvent <= (event.reveal_hours_before || 24));

  const isOnline = event.event_format === "online";
  const isHybrid = event.event_format === "hybrid";
  const isTestRun = typeof event.title === "string" && /^\[Test Run\]/i.test(event.title);
  const cleanTitle = isTestRun ? event.title.replace(/^\[Test Run\]\s*/i, "") : event.title;
  const copyShare = async () => {
    try { await navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied" }); } catch {}
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative h-[300px] md:h-[420px] overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute top-4 left-4 md:top-6 md:left-8">
          <Button variant="secondary" size="sm" className="rounded-full gap-2 shadow-lg" asChild>
            <Link to="/events"><ArrowLeft className="w-4 h-4" /> Back</Link>
          </Button>
        </div>
        <div className="absolute top-4 right-4 md:top-6 md:right-8 flex gap-2">
          <Button variant="secondary" size="icon" className="rounded-full shadow-lg h-9 w-9"><Heart className="w-4 h-4" /></Button>
          <Button variant="secondary" size="icon" className="rounded-full shadow-lg h-9 w-9"><Share2 className="w-4 h-4" /></Button>
        </div>
      </section>

      <section className="container px-4 md:px-8 -mt-16 relative z-10 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="lg:col-span-2 space-y-6">
            {isTestRun && (
              <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-background p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold tracking-wider text-amber-600 uppercase">Test Run · Public Notice</p>
                    <p className="text-sm font-bold mt-0.5">This event is being validated by the host.</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed flex items-start gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Your contribution is <span className="font-semibold text-foreground">100% refundable</span> if the event is cancelled or doesn't reach its threshold. You're helping decide if this happens for real.</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setRefundOpen(true)}
                      className="text-xs font-semibold text-amber-700 underline underline-offset-2 mt-2 hover:text-amber-800"
                    >
                      Read full refund policy
                    </button>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-xl shrink-0 hidden sm:inline-flex" onClick={copyShare}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Share
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">{event.category}</span>
                {isTestRun && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 flex items-center gap-1"><FlaskConical className="w-3 h-3" /> Test Run</span>}
                {event.open_to_sponsorship && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center gap-1"><Handshake className="w-3 h-3" /> Open to sponsorship</span>}
                {isOnline && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent flex items-center gap-1"><Globe className="w-3 h-3" /> Online</span>}
                {isHybrid && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent flex items-center gap-1"><Globe className="w-3 h-3" /> Hybrid</span>}
                {event.visibility === "private" && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-foreground flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>}
                {event.verified && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Verified</span>}
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{cleanTitle}</h1>
              <p className="text-sm text-muted-foreground mb-6">by <span className="font-semibold text-foreground">{event.organizer}</span></p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold">{event.fullDate}</p><p className="text-xs text-muted-foreground">{event.time}</p></div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  {isOnline ? <Globe className="w-5 h-5 text-primary mt-0.5 shrink-0" /> : <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    {showLocation ? (
                      <>
                        <p className="text-sm font-semibold truncate">{isOnline ? "Online event" : event.venue}</p>
                        <p className="text-xs text-muted-foreground truncate">{isOnline ? "Stream link shared with attendees" : event.location}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold flex items-center gap-1.5"><EyeOff className="w-3.5 h-3.5" /> Location hidden</p>
                        <p className="text-xs text-muted-foreground">
                          {reveal === "on_rsvp" ? "Reveals after RSVP / ticket" : `Reveals ${event.reveal_hours_before}h before start`}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold">Starts at {event.time}</p><p className="text-xs text-muted-foreground">Doors 30 mins early</p></div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold">{event.vibing} vibing</p><p className="text-xs text-muted-foreground">People interested</p></div>
                </div>
              </div>

              <h2 className="text-lg font-bold mb-3">About this event</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{event.description}</p>

              {showLocation && isOnline && event.online_url && (hasTicket || hasRsvp || isHost) && (
                <a href={event.online_url} target="_blank" rel="noopener noreferrer"
                  className="mt-5 block p-4 rounded-xl bg-primary/10 border border-primary/30 text-center text-sm font-bold text-primary">
                  <Globe className="inline w-4 h-4 mr-1.5" /> Join Live Stream
                </a>
              )}
            </div>

            {event.performers?.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-5"><Music className="w-5 h-5 text-primary" /><h2 className="text-lg font-bold">Lineup</h2></div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {event.performers.map((p: any) => (
                    <div key={p.name} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                      <Avatar className="h-12 w-12"><AvatarImage src={p.avatar} /><AvatarFallback className="text-xs font-bold">{p.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback></Avatar>
                      <div><p className="text-sm font-bold">{p.name}</p><p className="text-xs text-muted-foreground">{p.role}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(event.donate_flexit_url || event.donate_flexit_qr_url) && (
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <HeartIcon className="w-5 h-5 text-rose-500 fill-rose-500/30" />
                  <h2 className="text-lg font-bold">Support this event</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Chip in via the host's iBloov FlexIt — every bit helps make it happen.</p>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {event.donate_flexit_qr_url && (
                    <img src={event.donate_flexit_qr_url} alt="Donate QR" className="w-32 h-32 rounded-xl object-cover border border-border bg-white" />
                  )}
                  <div className="flex-1 w-full space-y-2">
                    {event.donate_flexit_url && (
                      <a href={event.donate_flexit_url} target="_blank" rel="noreferrer"
                        className="flex items-center justify-between gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/15 transition-colors">
                        <span className="text-sm font-bold text-rose-700 truncate">Donate via FlexIt</span>
                        <ExternalLink className="h-4 w-4 text-rose-700 shrink-0" />
                      </a>
                    )}
                    {event.donate_flexit_url && (
                      <p className="text-[11px] text-muted-foreground break-all">{event.donate_flexit_url}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">Donations go directly to the host's iBloov FlexIt wallet.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
              {event.requires_rsvp ? (
                <>
                  <h2 className="text-lg font-bold mb-1">RSVP</h2>
                  <p className="text-xs text-muted-foreground mb-5">Let the host know you're coming</p>
                  {hasRsvp ? (
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
                      <Check className="w-6 h-6 text-primary mx-auto mb-1" />
                      <p className="text-sm font-bold text-primary">You're going!</p>
                    </div>
                  ) : (
                    <Button className="w-full rounded-xl h-12 font-bold" onClick={() => setRsvpOpen(true)}>RSVP Now</Button>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold mb-1">Get Tickets</h2>
                  <p className="text-xs text-muted-foreground mb-5">{event.is_paid ? "Select a ticket type" : "Free event — reserve your spot"}</p>

                  <div className="space-y-3 mb-6">
                    {event.tickets.map((ticket: any, i: number) => (
                      <button key={i} onClick={() => setSelectedTicket(i)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedTicket === i ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold">{ticket.name}</span>
                          <span className="text-sm font-extrabold text-primary">{ticket.price}</span>
                        </div>
                        <ul className="space-y-1">
                          {ticket.perks.map((perk: string) => (
                            <li key={perk} className="text-xs text-muted-foreground flex items-center gap-1.5"><Check className="w-3 h-3 text-primary shrink-0" />{perk}</li>
                          ))}
                        </ul>
                        {isTestRun && ticket.test_fee_percent > 0 && (
                          <div className="mt-2 pt-2 border-t border-dashed border-border flex items-center gap-1.5 text-[10px] font-semibold text-amber-700">
                            <FlaskConical className="h-3 w-3" /> Paying {ticket.test_fee_percent}% of full ticket price · refundable if cancelled
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {isTestRun && (
                    <div className="mb-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Refund guarantee:</span> if this Test Run doesn't go live, you'll be refunded in full automatically.
                      </p>
                    </div>
                  )}

                  <Button className="w-full rounded-xl h-12 text-sm font-bold" onClick={() => setCheckoutOpen(true)}>
                    {event.tickets[selectedTicket].rawPrice === 0 ? "Reserve" : "Get"} {event.tickets[selectedTicket].name}
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center mt-3">Secure checkout · Instant QR ticket</p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} event={event} selectedTicketIndex={selectedTicket} />
      {isDbId && <RsvpDialog open={rsvpOpen} onOpenChange={setRsvpOpen} eventId={id!} eventTitle={event.title} onRsvped={() => setHasRsvp(true)} />}

      <Footer />
    </div>
  );
};

export default EventDetail;
