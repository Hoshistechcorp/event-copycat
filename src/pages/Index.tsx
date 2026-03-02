import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { CalendarPlus, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleHost = () => {
    if (user) {
      navigate("/create-event");
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      {/* CTA Cards */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
              What brings you here?
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Whether you're throwing the party or joining one — we've got you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Host an Event Card */}
            <motion.button
              onClick={handleHost}
              className="group relative overflow-hidden rounded-3xl p-8 md:p-10 text-left border border-border bg-card transition-all duration-500 hover:shadow-[0_8px_40px_hsl(var(--primary)/0.15)]"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -4 }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Glow circle */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <CalendarPlus className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Host an Event
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Create, manage, and sell tickets for your next unforgettable experience. Launch in minutes.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-300">
                  Get started
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            </motion.button>

            {/* Buy Tickets Card */}
            <motion.button
              onClick={() => navigate("/events")}
              className="group relative overflow-hidden rounded-3xl p-8 md:p-10 text-left border border-border bg-card transition-all duration-500 hover:shadow-[0_8px_40px_hsl(var(--accent)/0.15)]"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -4 }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Glow circle */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors duration-300">
                  <Ticket className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Buy Tickets
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Discover the hottest events around you. Secure your spot with just a few taps.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent group-hover:gap-3 transition-all duration-300">
                  Explore events
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            </motion.button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
