import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket, Calendar, MapPin, ArrowLeft, Search, Mail } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [searchedEmail, setSearchedEmail] = useState("");
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const lookupTickets = (lookupEmail: string) => {
    const stored = localStorage.getItem("purchased_tickets");
    if (!stored) {
      setTickets([]);
      setHasSearched(true);
      setSearchedEmail(lookupEmail);
      return;
    }
    const all: PurchasedTicket[] = JSON.parse(stored);
    const matched = all.filter(
      (t) => t.email.toLowerCase().trim() === lookupEmail.toLowerCase().trim()
    );
    setTickets(matched);
    setHasSearched(true);
    setSearchedEmail(lookupEmail);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    lookupTickets(email.trim());
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container px-4 md:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link to="/events"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Find My Tickets</h1>
            <p className="text-sm text-muted-foreground">Enter the email you used to purchase</p>
          </div>
        </div>

        {/* Email lookup form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto mb-10"
        >
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-bold text-card-foreground">Look up your tickets</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Enter the email address you used when purchasing your tickets to view them.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl flex-1"
                required
              />
              <Button type="submit" className="rounded-xl gap-2 px-5" disabled={!email.trim()}>
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
          </div>
        </motion.form>

        {/* Results */}
        {hasSearched && tickets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Ticket className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">No tickets found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              No tickets were found for <span className="font-semibold text-foreground">{searchedEmail}</span>
            </p>
            <Button className="rounded-full" asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
          </motion.div>
        )}

        {tickets.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} for{" "}
              <span className="font-semibold text-foreground">{searchedEmail}</span>
            </p>
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
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default MyTickets;
