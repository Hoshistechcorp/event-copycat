import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Check, QrCode, Download } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { allEvents } from "@/data/events";
import type { PurchasedTicket } from "@/pages/MyTickets";

const TicketDetail = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<PurchasedTicket | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("purchased_tickets");
    if (stored) {
      const tickets: PurchasedTicket[] = JSON.parse(stored);
      const found = tickets.find((t) => t.id === ticketId);
      setTicket(found || null);
    }
  }, [ticketId]);

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Ticket not found</h1>
          <p className="text-muted-foreground mb-6">This ticket doesn't exist or has been removed.</p>
          <Button asChild className="rounded-full">
            <Link to="/my-tickets">View My Tickets</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const event = allEvents.find((e) => e.id === ticket.eventId);
  if (!event) return null;

  const ticketTier = event.tickets.find((t) => t.name === ticket.ticketType);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container px-4 md:px-8 py-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/my-tickets")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Ticket Details</h1>
            <p className="text-xs text-muted-foreground">Order #{ticket.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {/* Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm mb-6"
        >
          {/* Event Banner */}
          <div className="relative h-48 overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary backdrop-blur-sm border border-primary/20">
                {ticket.ticketType}
              </span>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-card-foreground mb-1">{event.title}</h2>
            <p className="text-sm text-muted-foreground mb-5">by {event.organizer}</p>

            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{event.fullDate}</p>
                  <p className="text-[10px] text-muted-foreground">{event.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{event.venue}</p>
                  <p className="text-[10px] text-muted-foreground">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Dashed divider */}
            <div className="border-t-2 border-dashed border-border my-5 relative">
              <div className="absolute -left-8 -top-3.5 w-7 h-7 rounded-full bg-background" />
              <div className="absolute -right-8 -top-3.5 w-7 h-7 rounded-full bg-background" />
            </div>

            {/* QR Code area */}
            <div className="flex flex-col items-center py-4">
              <div className="w-36 h-36 rounded-xl bg-secondary/50 border border-border flex items-center justify-center mb-3">
                <QrCode className="w-20 h-20 text-muted-foreground/40" />
              </div>
              <p className="text-[10px] text-muted-foreground">Show this QR code at the entrance</p>
            </div>

            {/* Dashed divider */}
            <div className="border-t-2 border-dashed border-border my-5 relative">
              <div className="absolute -left-8 -top-3.5 w-7 h-7 rounded-full bg-background" />
              <div className="absolute -right-8 -top-3.5 w-7 h-7 rounded-full bg-background" />
            </div>

            {/* Ticket Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Ticket Type</span>
                <span className="text-xs font-bold text-foreground">{ticket.ticketType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Price</span>
                <span className="text-xs font-bold text-primary">{ticket.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Quantity</span>
                <span className="text-xs font-bold text-foreground">{ticket.quantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Attendee</span>
                <span className="text-xs font-bold text-foreground">{ticket.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Email</span>
                <span className="text-xs font-bold text-foreground">{ticket.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Purchased</span>
                <span className="text-xs font-bold text-foreground">
                  {new Date(ticket.purchasedAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Perks */}
            {ticketTier && (
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs font-bold text-foreground mb-2">Your perks</p>
                <ul className="space-y-1.5">
                  {ticketTier.perks.map((perk) => (
                    <li key={perk} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* Performers */}
        {event.performers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-5 md:p-6 shadow-sm mb-6"
          >
            <h3 className="text-sm font-bold text-card-foreground mb-4">Performing at this event</h3>
            <div className="flex flex-wrap gap-4">
              {event.performers.map((p) => (
                <div key={p.name} className="flex items-center gap-2.5">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={p.avatar} alt={p.name} />
                    <AvatarFallback className="text-[10px] font-bold">
                      {p.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold text-card-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" asChild>
            <Link to={`/events/${event.id}`}>View event page</Link>
          </Button>
          <Button variant="outline" className="rounded-xl gap-2" asChild>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${event.coordinates.lat},${event.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin className="w-3.5 h-3.5" /> Directions
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TicketDetail;
