import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Ticket, Calendar, MapPin, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { allEvents } from "@/data/events";

export interface PurchasedTicket {
  id: string;
  eventId: number;
  ticketType: string;
  price: string;
  quantity: number;
  purchasedAt: string;
  name: string;
  email: string;
}

const MyTickets = () => {
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("purchased_tickets");
    if (stored) setTickets(JSON.parse(stored));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container px-4 md:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link to="/events"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">My Tickets</h1>
            <p className="text-sm text-muted-foreground">Your purchased event tickets</p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Ticket className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">No tickets yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Browse events and grab your first ticket!</p>
            <Button className="rounded-full" asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((ticket, i) => {
              const event = allEvents.find((e) => e.id === ticket.eventId);
              if (!event) return null;
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/my-tickets/${ticket.id}`}
                    className="block bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img src={event.image} alt={event.title} className="w-full h-36 object-cover" />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {ticket.ticketType}
                        </span>
                        <span className="text-xs font-bold text-primary">{ticket.price}</span>
                      </div>
                      <h3 className="text-sm font-bold text-card-foreground mb-2">{event.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Calendar className="w-3 h-3" />
                        {event.fullDate} · {event.time}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <MapPin className="w-3 h-3" />
                        {event.venue}, {event.location}
                      </div>
                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Qty: {ticket.quantity}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(ticket.purchasedAt).toLocaleDateString()}
                        </span>
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
