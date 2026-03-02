import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BadgeCheck, MapPin, ChevronDown, Search, Navigation } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import event4 from "@/assets/event-4.jpg";
import event5 from "@/assets/event-5.jpg";
import event6 from "@/assets/event-6.jpg";

type EventCategory = "All" | "Music" | "Parties" | "Workshops";
type Location = "All Locations" | "Lagos" | "Abuja" | "Port Harcourt" | "Ibadan" | "Accra";

interface EventItem {
  id: number;
  title: string;
  organizer: string;
  date: string;
  price: string;
  image: string;
  vibing: string;
  verified: boolean;
  category: EventCategory;
  location: Location;
}

const events: EventItem[] = [
  { id: 1, title: "Vibes & Grills 3.0", organizer: "The Grill Master", date: "OCT 12", price: "₦5,000", image: event1, vibing: "120+", verified: true, category: "Parties", location: "Lagos" },
  { id: 2, title: "Tech Mixer Lagos", organizer: "Lagos Tech Hub", date: "OCT 15", price: "Free", image: event2, vibing: "85+", verified: false, category: "Workshops", location: "Lagos" },
  { id: 3, title: "Sip & Paint Night", organizer: "Art Studio X", date: "OCT 18", price: "₦7,500", image: event3, vibing: "45+", verified: false, category: "Workshops", location: "Abuja" },
  { id: 4, title: "Outdoor Cinema: Classics", organizer: "Park View Screens", date: "OCT 20", price: "₦3,000", image: event4, vibing: "200+", verified: true, category: "Parties", location: "Port Harcourt" },
  { id: 5, title: "Comedy Roast Night", organizer: "Lagos Laughs", date: "OCT 22", price: "₦10,000", image: event5, vibing: "150+", verified: false, category: "Music", location: "Ibadan" },
  { id: 6, title: "Morning Yoga Session", organizer: "Flow with Tola", date: "OCT 23", price: "Free", image: event6, vibing: "30+", verified: false, category: "Workshops", location: "Accra" },
];

const tabs: EventCategory[] = ["All", "Music", "Parties", "Workshops"];
const locations: Location[] = ["All Locations", "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Accra"];

const EventsSection = () => {
  const { formatPrice } = useCurrency();
  const [active, setActive] = useState<EventCategory>("All");
  const [selectedLocation, setSelectedLocation] = useState<Location>("All Locations");
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
        setLocationSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = locations
    .filter((loc) => loc.toLowerCase().includes(locationSearch.toLowerCase()))
    .slice(0, 4);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // For demo, default to Lagos as nearest
          setSelectedLocation("Lagos");
          setLocationOpen(false);
          setLocationSearch("");
        },
        () => {
          // Fallback on error
          setSelectedLocation("Lagos");
          setLocationOpen(false);
          setLocationSearch("");
        }
      );
    }
  };

  const filtered = events.filter((e) => {
    const categoryMatch = active === "All" || e.category === active;
    const locationMatch = selectedLocation === "All Locations" || e.location === selectedLocation;
    return categoryMatch && locationMatch;
  });

  return (
    <section id="events" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4 md:px-8">
        {/* Header row: title left, tabs right */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
              Discover Experiences
            </h2>
            {/* Eventbrite-style location selector */}
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground text-lg">Browsing events in</p>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setLocationOpen(!locationOpen)}
                  className="inline-flex items-center gap-1.5 text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  {selectedLocation === "All Locations" ? "Choose a location" : selectedLocation}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${locationOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {locationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 z-50 w-[260px] bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                    >
                      {/* Search input */}
                      <div className="p-2 border-b border-border">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50">
                          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <input
                            type="text"
                            placeholder="Search location..."
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Use precise location */}
                      <button
                        onClick={handleUseMyLocation}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 text-primary hover:bg-accent font-medium border-b border-border"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Use my precise location
                      </button>

                      {/* Location list (max 4) */}
                      {filteredLocations.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setSelectedLocation(loc);
                            setLocationOpen(false);
                            setLocationSearch("");
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                            selectedLocation === loc
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          {loc}
                        </button>
                      ))}
                      {filteredLocations.length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground text-center">No locations found</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex gap-1 border border-border rounded-full p-1 bg-card">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  active === tab
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((event) => (
              <Link to={`/events/${event.id}`} key={event.id}>
              <div
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-lg border border-border">
                    {event.date}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {event.verified && (
                      <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-lg border border-border">
                    {formatPrice(event.price)}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-card-foreground">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">by {event.organizer}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-muted-foreground/30" />
                        <div className="w-5 h-5 rounded-full bg-muted-foreground/20" />
                        <div className="w-5 h-5 rounded-full bg-muted-foreground/15" />
                      </div>
                      <span>{event.vibing} vibing</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary/50" />
                  </div>
                </div>
              </div>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-10">
          <Button variant="outline" className="rounded-full px-8 font-semibold" asChild>
            <a href="/events">View All Events</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
