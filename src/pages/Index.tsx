import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { CalendarPlus, Ticket, Sparkles } from "lucide-react";
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
            className="text-center mb-14"
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

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Host an Event Card */}
            <motion.button
              onClick={handleHost}
              className="group relative overflow-hidden rounded-[2rem] min-h-[220px] p-8 text-left bg-secondary transition-all duration-500 hover:shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-primary/10 rotate-12 group-hover:rotate-6 transition-transform duration-500 flex items-center justify-center">
                <CalendarPlus className="w-16 h-16 text-primary/30 -rotate-12 group-hover:-rotate-6 transition-transform duration-500" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full bg-accent/10 group-hover:bg-accent/15 transition-colors duration-500" />

              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-lg bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                  For Creators
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2 leading-tight">
                  Host an Event
                </h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-[240px]">
                  Launch and sell tickets in minutes!
                </p>
              </div>
            </motion.button>

            {/* Buy Tickets Card */}
            <motion.button
              onClick={() => navigate("/events")}
              className="group relative overflow-hidden rounded-[2rem] min-h-[220px] p-8 text-left bg-secondary transition-all duration-500 hover:shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-accent/10 -rotate-12 group-hover:-rotate-6 transition-transform duration-500 flex items-center justify-center">
                <Ticket className="w-16 h-16 text-accent/30 rotate-12 group-hover:rotate-6 transition-transform duration-500" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors duration-500" />

              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-lg bg-accent/15 text-accent text-xs font-bold uppercase tracking-wider mb-4">
                  For Everyone
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2 leading-tight">
                  Buy Tickets
                </h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-[240px]">
                  Discover events and secure your spot!
                </p>
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
