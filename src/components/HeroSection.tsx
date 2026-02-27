import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import event4 from "@/assets/event-4.jpg";
import event5 from "@/assets/event-5.jpg";
import eventHero from "@/assets/event-hero.jpg";

const cities = ["Lagos", "Accra", "Nairobi", "London", "Dubai"];

const heroEvents = [
  { image: eventHero, title: "Afrobeat Night Out", venue: "Eko Hotel", date: "Dec 20, 2026", price: "₦15,000", vibing: "200+" },
  { image: event1, title: "Vibes & Grills 3.0", venue: "Lekki Phase 1", date: "Oct 12, 2026", price: "₦5,000", vibing: "120+" },
  { image: event2, title: "Tech Mixer Lagos", venue: "Civic Centre", date: "Oct 15, 2026", price: "Free", vibing: "85+" },
  { image: event3, title: "Sip & Paint Night", venue: "Art Studio X", date: "Oct 18, 2026", price: "₦7,500", vibing: "45+" },
  { image: event4, title: "Outdoor Cinema", venue: "Park View", date: "Oct 20, 2026", price: "₦3,000", vibing: "200+" },
  { image: event5, title: "Comedy Roast Night", venue: "The Vault", date: "Oct 22, 2026", price: "₦10,000", vibing: "150+" },
];

const HeroSection = () => {
  const [cityIndex, setCityIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [eventIndex, setEventIndex] = useState(0);

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

  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="container px-4 md:px-8 py-20 md:py-28">
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

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-foreground mb-6">
              Delightful events{" "}
              <br className="hidden sm:block" />
              start{" "}
              <span className="text-gradient-accent border-r-2 border-accent animate-cursor-blink pr-1">
                {displayText}
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Set up an event page, invite friends and sell tickets. Host a
              memorable event today with iBLOOV.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Button size="lg" className="rounded-full px-8 font-semibold text-base">
                Create Your First Event
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 font-semibold text-base"
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

          {/* Right - stacked cards with hover tilt */}
          <motion.div
            className="hidden lg:flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ perspective: 1200 }}
          >
            <div className="relative w-[340px] h-[460px]">
              {/* Back card 2 */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-[hsl(45,30%,92%)] border border-border shadow-lg -rotate-6 scale-[0.94] origin-bottom-center"
                initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
                animate={{ opacity: 1, rotate: -6, scale: 0.94 }}
                transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 120 }}
              />
              {/* Back card 1 */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-[hsl(45,20%,96%)] border border-border shadow-lg rotate-3 scale-[0.97] origin-bottom-center"
                initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 3, scale: 0.97 }}
                transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 120 }}
              />
              {/* Main card */}
              <motion.div
                className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-card border border-border cursor-pointer"
                whileHover={{ rotate: 3, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="relative overflow-hidden h-[340px]">
                  {heroEvents.map((evt, i) => (
                    <motion.img
                      key={i}
                      src={evt.image}
                      alt={evt.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: i === eventIndex ? 1 : 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  ))}
                </div>
                <motion.div
                  className="p-5 bg-card"
                  key={eventIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-lg font-bold text-card-foreground">{currentEvent.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentEvent.venue} • {currentEvent.date}
                  </p>
                </motion.div>

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
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
