import { useParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BadgeCheck, MapPin, Calendar, Clock, Users, ArrowLeft, Share2, Heart, Check, Music, Loader2, Globe, Lock, EyeOff, FlaskConical, ShieldCheck, Handshake, Heart as HeartIcon, Copy, ExternalLink, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutModal from "@/components/CheckoutModal";
import RsvpDialog from "@/components/RsvpDialog";
import { allEvents } from "@/data/events";
import { useDbEvent } from "@/hooks/useDbEvents";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { parseVideoUrl } from "@/lib/videoEmbed";

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
  const [sponsorMessage, setSponsorMessage] = useState("");

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

              {(event as any).video_url && (() => {
                const parsed = parseVideoUrl((event as any).video_url);
                if (!parsed) return null;
                return (
                  <div className="mt-5">
                    <h3 className="text-sm font-bold mb-2">Watch</h3>
                    {parsed.canEmbed && parsed.embedUrl ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-black">
                        <iframe
                          src={parsed.embedUrl}
                          title="Event video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        />
                      </div>
                    ) : (
                      <a href={parsed.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-sm font-bold text-primary hover:bg-primary/15">
                        <Globe className="w-4 h-4" /> Watch on {parsed.label}
                      </a>
                    )}
                  </div>
                );
              })()}

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
                  <HeartIcon className="w-5 h-5 text-rose-500 fill-rose-500/30" aria-hidden="true" />
                  <h2 className="text-lg font-bold">Support this event</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Chip in via the host's iBloov FlexIt — every bit helps make it happen.</p>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {event.donate_flexit_qr_url && (
                    <img
                      src={event.donate_flexit_qr_url}
                      alt={`Scan this QR code to donate to ${cleanTitle} via iBloov FlexIt`}
                      className="w-32 h-32 rounded-xl object-cover border border-border bg-white"
                    />
                  )}
                  <div className="flex-1 w-full space-y-2">
                    {event.donate_flexit_url && (
                      <a
                        href={event.donate_flexit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Donate to ${cleanTitle} via iBloov FlexIt (opens in a new tab)`}
                        className="flex items-center justify-between gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/15 transition-colors"
                      >
                        <span className="text-sm font-bold text-rose-700 truncate">Donate via FlexIt</span>
                        <ExternalLink className="h-4 w-4 text-rose-700 shrink-0" aria-hidden="true" />
                      </a>
                    )}
                    {event.donate_flexit_url && (
                      <p className="text-[11px] text-muted-foreground break-all">{event.donate_flexit_url}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">Donations go directly to the host's iBloov FlexIt wallet. Opens in a new tab.</p>
                  </div>
                </div>
              </div>
            )}

            {event.open_to_sponsorship && (
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Handshake className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  <h2 className="text-lg font-bold">Open to sponsorship & brand deals</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  The host has flagged this {isTestRun ? "Test Run" : "event"} as open to brand partners. If your brand wants visibility, activations, or co-branded moments, here's how it works.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-secondary/60 border border-border">
                    <p className="text-xs font-bold mb-1">1. Get a feel</p>
                    <p className="text-[11px] text-muted-foreground">Review the lineup, audience, and {isTestRun ? "Test-Run interest signal" : "expected attendance"}.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/60 border border-border">
                    <p className="text-xs font-bold mb-1">2. Pitch a fit</p>
                    <p className="text-[11px] text-muted-foreground">Tell the host what your brand wants — stage time, samples, signage, content collab.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/60 border border-border">
                    <p className="text-xs font-bold mb-1">3. Lock the deal</p>
                    <p className="text-[11px] text-muted-foreground">Agree on perks and budget directly with the host before the event goes live.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button className="rounded-xl flex-1" onClick={() => setSponsorOpen(true)}>
                    <Handshake className="h-4 w-4 mr-1.5" aria-hidden="true" /> Contact the host
                  </Button>
                  <Button variant="outline" className="rounded-xl flex-1" asChild>
                    <Link to="/sponsorships"><ExternalLink className="h-4 w-4 mr-1.5" aria-hidden="true" /> Browse sponsorship hub</Link>
                  </Button>
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
                  {isTestRun && event.tickets?.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <FlaskConical className="h-4 w-4 text-amber-600" />
                        <h3 className="text-sm font-bold">Test Run contribution tiers</h3>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-3">RSVP is required, and you also back the tier you'd buy at full price. You only pay a fraction now — refundable if the event doesn't go live.</p>
                      <div className="space-y-2">
                        {event.tickets.map((ticket: any, i: number) => {
                          const pct = Number(ticket.test_fee_percent) || 0;
                          const raw = Number(ticket.rawPrice) || 0;
                          const due = pct > 0 ? (raw * pct) / 100 : raw;
                          const cur = event.currency || "NGN";
                          const fmt = (n: number) => n === 0 ? "Free" : `${cur} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
                          return (
                            <button
                              key={i}
                              onClick={() => { setSelectedTicket(i); setCheckoutOpen(true); }}
                              className="w-full text-left p-3 rounded-xl border border-border bg-secondary/40 hover:border-primary hover:bg-primary/5 transition-all"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold">{ticket.name}</span>
                                <span className="text-xs font-extrabold text-primary">{fmt(due)}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>Full price: <span className="line-through">{ticket.price}</span></span>
                                {pct > 0 && <span className="font-semibold text-amber-700">Pay {pct}% now</span>}
                              </div>
                              <div className="mt-2 text-[10px] font-bold text-primary">Pay contribution →</div>
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={() => setRefundOpen(true)} className="text-[11px] text-primary font-semibold mt-3 hover:underline">
                        Read full refund policy →
                      </button>
                    </div>
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
                          <div className="mt-2 pt-2 border-t border-dashed border-border space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700">
                              <FlaskConical className="h-3 w-3" /> Pay {ticket.test_fee_percent}% now · {(event.currency || "NGN")} {((Number(ticket.rawPrice) || 0) * ticket.test_fee_percent / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                            <p className="text-[10px] text-muted-foreground">Refundable if the Test Run is cancelled</p>
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
                    {event.tickets[selectedTicket].rawPrice === 0
                      ? `Reserve ${event.tickets[selectedTicket].name}`
                      : isTestRun && event.tickets[selectedTicket].test_fee_percent > 0
                        ? `Pay ${event.tickets[selectedTicket].test_fee_percent}% Test Run contribution`
                        : `Get ${event.tickets[selectedTicket].name}`}
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

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" /> Test Run refund policy
            </DialogTitle>
            <DialogDescription>
              Test Runs let hosts gauge real interest before committing. Your money is protected the whole time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <p className="font-semibold mb-1">100% refund — automatic</p>
              <p className="text-xs text-muted-foreground">If the host cancels, doesn't reach the interest threshold, or doesn't promote the Test Run to a live event before the scheduled date, every contribution is refunded in full to the original payment method within 5–10 business days.</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/60 border border-border">
              <p className="font-semibold mb-1">If the event goes live</p>
              <p className="text-xs text-muted-foreground">Your Test Run contribution is converted into a real ticket at the tier you backed. You'll receive a QR ticket by email.</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/60 border border-border">
              <p className="font-semibold mb-1">Donations via FlexIt</p>
              <p className="text-xs text-muted-foreground">FlexIt donations are voluntary and processed by the host's iBloov FlexIt wallet. They're <span className="font-semibold">not refundable</span> through the Test Run guarantee — only ticket contributions are.</p>
            </div>
            <p className="text-[11px] text-muted-foreground">Need help with a specific refund? Contact iBloov Support from the help center.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sponsorOpen} onOpenChange={(o) => {
        setSponsorOpen(o);
        if (o) {
          setSponsorMessage(
            `Hi ${event.organizer || "there"},\n\nI'd like to discuss a sponsorship / brand partnership for "${cleanTitle}" on ${event.fullDate || "the event date"}.\n\nA bit about us:\n- Brand: \n- What we'd like to offer: \n- Budget range: \n\nLooking forward to your reply.`
          );
        }
      }}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-emerald-600" aria-hidden="true" /> Pitch this host
            </DialogTitle>
            <DialogDescription>
              Customize your enquiry below — it'll be prefilled into the host contact page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="sponsor-msg" className="text-xs font-semibold">Your message</Label>
              <Textarea
                id="sponsor-msg"
                value={sponsorMessage}
                onChange={(e) => setSponsorMessage(e.target.value)}
                rows={8}
                className="rounded-xl text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">{sponsorMessage.length} characters</p>
            </div>
            {(() => {
              const params = new URLSearchParams({
                topic: "sponsorship",
                eventTitle: cleanTitle,
                eventDate: event.fullDate || "",
                subject: `Sponsorship enquiry — ${cleanTitle}`,
                message: sponsorMessage,
              });
              return (
                <Button asChild className="w-full rounded-xl justify-start" disabled={!sponsorMessage.trim()}>
                  <Link to={`/contact?${params.toString()}`}>
                    <Mail className="h-4 w-4 mr-2" aria-hidden="true" /> Open host contact page (prefilled)
                  </Link>
                </Button>
              );
            })()}
            <Button asChild className="w-full rounded-xl justify-start" variant="outline">
              <Link to="/sponsorships"><Handshake className="h-4 w-4 mr-2" aria-hidden="true" /> Submit an offer via Sponsorship Hub</Link>
            </Button>
            <p className="text-[11px] text-muted-foreground pt-2">For privacy, host emails aren't published. iBloov forwards verified brand requests directly to the host.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default EventDetail;
