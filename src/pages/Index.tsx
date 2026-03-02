import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import ctaHostImg from "@/assets/cta-host.jpg";
import ctaTicketsImg from "@/assets/cta-tickets.jpg";

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
            <motion.div
              className="group relative overflow-hidden rounded-[2rem] min-h-[320px] cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={handleHost}
            >
              <img
                src={ctaHostImg}
                alt="Host an event"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 flex flex-col justify-end h-full p-8">
                <span className="inline-block self-start px-3 py-1 rounded-lg bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider mb-3">
                  For Creators
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
                  Host an Event
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-5 max-w-[280px]">
                  Create, manage, and sell tickets for your next unforgettable experience.
                </p>
                <Button
                  size="lg"
                  className="self-start rounded-xl font-semibold"
                  onClick={(e) => { e.stopPropagation(); handleHost(); }}
                >
                  Get Started
                </Button>
              </div>
            </motion.div>

            {/* Buy Tickets Card */}
            <motion.div
              className="group relative overflow-hidden rounded-[2rem] min-h-[320px] cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => navigate("/events")}
            >
              <img
                src={ctaTicketsImg}
                alt="Buy tickets"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 flex flex-col justify-end h-full p-8">
                <span className="inline-block self-start px-3 py-1 rounded-lg bg-accent/90 text-accent-foreground text-xs font-bold uppercase tracking-wider mb-3">
                  For Everyone
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
                  Buy Tickets
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-5 max-w-[280px]">
                  Discover the hottest events around you. Secure your spot with just a few taps.
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="self-start rounded-xl font-semibold"
                  onClick={(e) => { e.stopPropagation(); navigate("/events"); }}
                >
                  Explore Events
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
