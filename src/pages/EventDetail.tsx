import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BadgeCheck, MapPin, Calendar, Clock, Users, ArrowLeft, Share2, Heart, Check, Music, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutModal from "@/components/CheckoutModal";
import { allEvents } from "@/data/events";
import { useDbEvent } from "@/hooks/useDbEvents";
import { useState, useMemo } from "react";

const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const EventDetail = () => {
  const { id } = useParams();
  const isDbId = id ? isUuid(id) : false;
  const { data: dbEvent, isLoading } = useDbEvent(isDbId ? id! : "");

  const event = useMemo(() => {
    if (isDbId) return dbEvent || null;
    return allEvents.find((e) => e.id === Number(id)) || null;
  }, [id, isDbId, dbEvent]);

  const [selectedTicket, setSelectedTicket] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (isLoading && isDbId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event not found</h1>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="rounded-full">
            <Link to="/events">Browse Events</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedEvents = allEvents.filter((e) => e.category === event.category && e.id !== event.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Image */}
      <section className="relative h-[300px] md:h-[420px] overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute top-4 left-4 md:top-6 md:left-8">
          <Button variant="secondary" size="sm" className="rounded-full gap-2 shadow-lg" asChild>
            <Link to="/events"><ArrowLeft className="w-4 h-4" /> Back to Events</Link>
          </Button>
        </div>
        <div className="absolute top-4 right-4 md:top-6 md:right-8 flex gap-2">
          <Button variant="secondary" size="icon" className="rounded-full shadow-lg h-9 w-9">
            <Heart className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full shadow-lg h-9 w-9">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Content */}
      <section className="container px-4 md:px-8 -mt-16 relative z-10 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Event Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {event.category}
                </span>
                {event.verified && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-card-foreground mb-2">{event.title}</h1>
              <p className="text-sm text-muted-foreground mb-6">by <span className="font-semibold text-foreground">{event.organizer}</span></p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{event.fullDate}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{event.venue}</p>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Starts at {event.time}</p>
                    <p className="text-xs text-muted-foreground">Doors open 30 mins early</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{event.vibing} vibing</p>
                    <p className="text-xs text-muted-foreground">People interested</p>
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-bold text-card-foreground mb-3">About this event</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

            {/* Performers */}
            {event.performers.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Music className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-card-foreground">Performing at this event</h2>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {event.performers.map((performer) => (
                    <div key={performer.name} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={performer.avatar} alt={performer.name} />
                        <AvatarFallback className="text-xs font-bold">
                          {performer.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-card-foreground">{performer.name}</p>
                        <p className="text-xs text-muted-foreground">{performer.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-card-foreground">Event Location</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{event.venue}, {event.location}</p>
              <div className="rounded-xl overflow-hidden border border-border aspect-video">
                <iframe
                  title="Event location map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${event.coordinates.lat},${event.coordinates.lng}&zoom=15`}
                />
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${event.coordinates.lat},${event.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-3"
              >
                <MapPin className="w-3.5 h-3.5" /> Get directions
              </a>
            </div>

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">More {event.category} events</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {relatedEvents.map((re) => (
                    <Link key={re.id} to={`/events/${re.id}`} className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
                      <div className="relative overflow-hidden">
                        <img src={re.image} alt={re.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-2 left-2 bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-bold px-2 py-1 rounded-md border border-border">{re.date}</span>
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-bold text-card-foreground leading-tight">{re.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{re.venue}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right: Ticket Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-card-foreground mb-1">Get Tickets</h2>
              <p className="text-xs text-muted-foreground mb-5">Select a ticket type below</p>

              <div className="space-y-3 mb-6">
                {event.tickets.map((ticket, i) => (
                  <button
                    key={ticket.name}
                    onClick={() => setSelectedTicket(i)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedTicket === i
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-card-foreground">{ticket.name}</span>
                      <span className="text-sm font-extrabold text-primary">{ticket.price}</span>
                    </div>
                    <ul className="space-y-1">
                      {ticket.perks.map((perk) => (
                        <li key={perk} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-primary shrink-0" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <Button
                className="w-full rounded-xl h-12 text-sm font-bold"
                onClick={() => setCheckoutOpen(true)}
              >
                Get {event.tickets[selectedTicket].name} — {event.tickets[selectedTicket].price}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                Secure checkout · Instant confirmation
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        event={event}
        selectedTicketIndex={selectedTicket}
      />

      <Footer />
    </div>
  );
};

export default EventDetail;
