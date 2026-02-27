import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import eventHero from "@/assets/event-hero.jpg";

const cities = ["Lagos", "Accra", "Nairobi", "London", "Dubai"];

const HeroSection = () => {
  const [cityIndex, setCityIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

          {/* Right - tilted card */}
          <motion.div
            className="hidden lg:flex justify-center"
            initial={{ opacity: 0, rotate: 8, y: 40 }}
            animate={{ opacity: 1, rotate: 6, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-[320px] rounded-2xl overflow-hidden shadow-2xl bg-card border border-border transform hover:rotate-0 transition-transform duration-500">
              <img
                src={eventHero}
                alt="Afrobeat Night Out event"
                className="w-full h-[280px] object-cover"
              />
              <div className="p-5">
                <h3 className="text-lg font-bold text-card-foreground">Afrobeat Night Out</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Eko Hotel • Dec 20, 2026
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
