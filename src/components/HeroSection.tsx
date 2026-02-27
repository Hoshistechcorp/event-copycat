import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import event4 from "@/assets/event-4.jpg";
import event5 from "@/assets/event-5.jpg";
import eventHero from "@/assets/event-hero.jpg";

const cities = ["Lagos", "Accra", "Nairobi", "London", "Dubai"];

const heroEvents = [
  { image: eventHero, title: "Afrobeat Night Out", venue: "Eko Hotel", date: "Dec 20, 2026" },
  { image: event1, title: "Vibes & Grills 3.0", venue: "Lekki Phase 1", date: "Oct 12, 2026" },
  { image: event2, title: "Tech Mixer Lagos", venue: "Civic Centre", date: "Oct 15, 2026" },
  { image: event3, title: "Sip & Paint Night", venue: "Art Studio X", date: "Oct 18, 2026" },
  { image: event4, title: "Outdoor Cinema", venue: "Park View", date: "Oct 20, 2026" },
  { image: event5, title: "Comedy Roast Night", venue: "The Vault", date: "Oct 22, 2026" },
];

const HeroSection = () => {
  const [cityIndex, setCityIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [eventIndex, setEventIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const currentCity = cities[cityIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText === currentCity) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCityIndex((prev) => (prev + 1) % cities.length);
    } else {
      timeout = setTimeout(
        () => {
          setDisplayText(
            isDeleting
              ? currentCity.slice(0, displayText.length - 1)
              : currentCity.slice(0, displayText.length + 1)
          );
        },
        isDeleting ? 60 : 120
      );
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, cityIndex]);

  // Cycle through events
  useEffect(() => {
    const interval = setInterval(() => {
      setEventIndex((prev) => (prev + 1) % heroEvents.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentEvent = heroEvents[eventIndex];
  const prevEvent = heroEvents[(eventIndex - 1 + heroEvents.length) % heroEvents.length];
  const nextEvent = heroEvents[(eventIndex + 1) % heroEvents.length];

  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="container px-4 md:px-8 py-16 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-sm font-medium text-muted-foreground mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              The #1 Event Platform in Africa
            </span>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-foreground mb-6">
              Delightful events{" "}
              <br className="hidden sm:block" />
              start{" "}
              <span className="text-gradient-accent border-r-2 border-accent animate-cursor-blink pr-1">
                {displayText}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-md mb-8">
              Set up an event page, invite friends and sell tickets. Host a
              memorable event today with iBLOOV.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Button size="lg" className="rounded-full px-6 sm:px-8 font-semibold text-base">
                Create Your First Event
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-6 sm:px-8 font-semibold text-base"
              >
                Sign In
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-6 border-t border-border">
              <div>
                <p className="text-2xl font-extrabold text-foreground">50k+</p>
                <p className="text-sm text-muted-foreground">Tickets Sold</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-2xl font-extrabold text-foreground">1200+</p>
                <p className="text-sm text-muted-foreground">Organizers</p>
              </div>
            </div>
          </motion.div>

          {/* Right - stacked cards with prev/next previews */}
          <motion.div
            className="hidden lg:flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ perspective: 1200 }}
          >
            <div className="relative w-[340px] h-[460px]">
              {/* Back card LEFT - previous event */}
              <motion.div
                className="absolute inset-0 rounded-3xl overflow-hidden border border-border shadow-lg origin-bottom-center"
                initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
                animate={{ opacity: 1, rotate: -8, scale: 0.92, x: -24 }}
                transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 120 }}
              >
                <img
                  src={prevEvent.image}
                  alt={prevEvent.title}
                  className="w-full h-full object-cover opacity-40"
                />
              </motion.div>

              {/* Back card RIGHT - next event */}
              <motion.div
                className="absolute inset-0 rounded-3xl overflow-hidden border border-border shadow-lg origin-bottom-center"
                initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 6, scale: 0.95, x: 24 }}
                transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 120 }}
              >
                <img
                  src={nextEvent.image}
                  alt={nextEvent.title}
                  className="w-full h-full object-cover opacity-40"
                />
              </motion.div>

              {/* Main card wrapper with animated border */}
              <div
                className="relative w-full h-full z-10"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Animated color-shifting border */}
                <motion.div
                  className="absolute -inset-[2px] rounded-3xl pointer-events-none"
                  style={{
                    background: isHovered
                      ? "conic-gradient(from var(--border-angle, 0deg), hsl(228,65%,55%), hsl(280,100%,60%), hsl(38,95%,55%), hsl(180,100%,50%), hsl(320,100%,65%), hsl(228,65%,55%))"
                      : "hsl(var(--border))",
                    opacity: isHovered ? 1 : 1,
                    transition: "opacity 0.4s ease",
                  }}
                  animate={isHovered ? { "--border-angle": ["0deg", "360deg"] } as any : {}}
                  transition={isHovered ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
                />

                <motion.div
                  className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-card cursor-pointer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 120 }}
                  whileHover={{ rotate: 2, scale: 1.03 }}
                  style={{
                    boxShadow: isHovered
                      ? "0 0 25px hsl(280 100% 60% / 0.3), 0 0 50px hsl(228 65% 55% / 0.15)"
                      : "0 25px 50px -12px rgb(0 0 0 / 0.25)",
                    transition: "box-shadow 0.5s ease",
                  }}
                >
                  {/* Glow overlay */}
                  <div className="absolute inset-0 z-20 pointer-events-none rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-accent/15" />
                  <motion.div
                    className="absolute inset-0 z-20 pointer-events-none rounded-3xl"
                    animate={{
                      boxShadow: isHovered
                        ? "inset 0 0 80px hsl(280 100% 60% / 0.12)"
                        : "inset 0 0 60px rgba(99,102,241,0.08)",
                    }}
                    transition={{ duration: 0.4 }}
                  />

                <div className="relative overflow-hidden h-[340px]">
                  <AnimatePresence mode="popLayout">
                    <motion.img
                      key={eventIndex}
                      src={currentEvent.image}
                      alt={currentEvent.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ x: 300, rotate: 8, opacity: 0 }}
                      animate={{ x: 0, rotate: 0, opacity: 1 }}
                      exit={{ x: -300, rotate: -8, opacity: 0 }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 150, damping: 20 }}
                    />
                  </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    className="p-5 bg-card"
                    key={eventIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-lg font-bold text-card-foreground">{currentEvent.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentEvent.venue} • {currentEvent.date}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Dots indicator */}
                <div className="flex justify-center gap-1.5 pb-4 bg-card">
                  {heroEvents.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setEventIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === eventIndex ? "bg-primary w-4" : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
