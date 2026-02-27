import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import eventHero from "@/assets/event-hero.jpg";

const cities = ["Lagos", "Accra", "Nairobi", "London", "Dubai"];

const HeroSection = () => {
  const [cityIndex, setCityIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), { stiffness: 150, damping: 20 });
  const glareX = useTransform(mouseX, [-300, 300], [0, 100]);
  const glareY = useTransform(mouseY, [-300, 300], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

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

          {/* Right - interactive 3D card */}
          <motion.div
            className="hidden lg:flex justify-center perspective-[1200px]"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative w-[400px] rounded-3xl overflow-hidden shadow-2xl bg-card border border-border cursor-grab active:cursor-grabbing"
            >
              {/* Glare overlay */}
              <motion.div
                className="absolute inset-0 z-10 pointer-events-none rounded-3xl"
                style={{
                  background: useTransform(
                    [glareX, glareY],
                    ([x, y]) =>
                      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
                  ),
                }}
              />
              <img
                src={eventHero}
                alt="Afrobeat Night Out event"
                className="w-full h-[360px] object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-card-foreground">Afrobeat Night Out</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Eko Hotel • Dec 20, 2026
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-semibold text-primary">₦15,000</span>
                  <span className="text-xs text-muted-foreground">200+ vibing</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
