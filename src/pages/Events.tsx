import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BadgeCheck, MapPin, ChevronDown, Search, Navigation, Calendar, SlidersHorizontal, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import event4 from "@/assets/event-4.jpg";
import event5 from "@/assets/event-5.jpg";
import event6 from "@/assets/event-6.jpg";

type EventCategory = "All" | "Music" | "Parties" | "Workshops" | "Tech" | "Food & Drink" | "Arts" | "Sports";
type Location = "All Locations" | "Lagos" | "Abuja" | "Port Harcourt" | "Ibadan" | "Accra";
type DateFilter = "Any Date" | "Today" | "This Weekend" | "This Week" | "This Month";

interface EventItem {
  id: number;
  title: string;
  organizer: string;
  date: string;
  fullDate: string;
  time: string;
  price: string;
  image: string;
  vibing: string;
  verified: boolean;
  category: EventCategory;
  location: Location;
  venue: string;
}

const allEvents: EventItem[] = [
  { id: 1, title: "Vibes & Grills 3.0", organizer: "The Grill Master", date: "OCT 12", fullDate: "Saturday, October 12, 2025", time: "4:00 PM", price: "₦5,000", image: event1, vibing: "120+", verified: true, category: "Parties", location: "Lagos", venue: "Lekki Phase 1" },
  { id: 2, title: "Tech Mixer Lagos", organizer: "Lagos Tech Hub", date: "OCT 15", fullDate: "Tuesday, October 15, 2025", time: "10:00 AM", price: "Free", image: event2, vibing: "85+", verified: false, category: "Tech", location: "Lagos", venue: "Co-Creation Hub, Yaba" },
  { id: 3, title: "Sip & Paint Night", organizer: "Art Studio X", date: "OCT 18", fullDate: "Friday, October 18, 2025", time: "6:00 PM", price: "₦7,500", image: event3, vibing: "45+", verified: false, category: "Arts", location: "Abuja", venue: "Wuse 2 Art Gallery" },
  { id: 4, title: "Outdoor Cinema: Classics", organizer: "Park View Screens", date: "OCT 20", fullDate: "Sunday, October 20, 2025", time: "7:30 PM", price: "₦3,000", image: event4, vibing: "200+", verified: true, category: "Parties", location: "Port Harcourt", venue: "Port Harcourt Pleasure Park" },
  { id: 5, title: "Comedy Roast Night", organizer: "Lagos Laughs", date: "OCT 22", fullDate: "Tuesday, October 22, 2025", time: "8:00 PM", price: "₦10,000", image: event5, vibing: "150+", verified: false, category: "Music", location: "Ibadan", venue: "Ventura Mall, Samonda" },
  { id: 6, title: "Morning Yoga Session", organizer: "Flow with Tola", date: "OCT 23", fullDate: "Wednesday, October 23, 2025", time: "6:30 AM", price: "Free", image: event6, vibing: "30+", verified: false, category: "Sports", location: "Accra", venue: "Labadi Beach" },
  { id: 7, title: "Afrobeats Dance Class", organizer: "Dance Lagos", date: "OCT 25", fullDate: "Friday, October 25, 2025", time: "5:00 PM", price: "₦4,000", image: event1, vibing: "60+", verified: true, category: "Music", location: "Lagos", venue: "National Theatre, Iganmu" },
  { id: 8, title: "Startup Pitch Night", organizer: "Founders Club", date: "OCT 26", fullDate: "Saturday, October 26, 2025", time: "3:00 PM", price: "Free", image: event2, vibing: "95+", verified: true, category: "Tech", location: "Abuja", venue: "Transcorp Hilton" },
  { id: 9, title: "Jollof Cook-Off", organizer: "Foodies NG", date: "OCT 28", fullDate: "Monday, October 28, 2025", time: "12:00 PM", price: "₦2,500", image: event3, vibing: "180+", verified: false, category: "Food & Drink", location: "Lagos", venue: "Eko Atlantic" },
  { id: 10, title: "Open Mic Poetry", organizer: "Verse Lagos", date: "OCT 30", fullDate: "Wednesday, October 30, 2025", time: "7:00 PM", price: "₦1,500", image: event4, vibing: "40+", verified: false, category: "Arts", location: "Ibadan", venue: "UI Conference Centre" },
  { id: 11, title: "Beach Volleyball Tournament", organizer: "Sports NG", date: "NOV 1", fullDate: "Friday, November 1, 2025", time: "9:00 AM", price: "₦3,500", image: event5, vibing: "110+", verified: true, category: "Sports", location: "Lagos", venue: "Elegushi Beach" },
  { id: 12, title: "Wine Tasting Evening", organizer: "Vine & Dine", date: "NOV 3", fullDate: "Sunday, November 3, 2025", time: "6:00 PM", price: "₦15,000", image: event6, vibing: "35+", verified: false, category: "Food & Drink", location: "Abuja", venue: "Sheraton Hotel" },
];

const categories: EventCategory[] = ["All", "Music", "Parties", "Workshops", "Tech", "Food & Drink", "Arts", "Sports"];
const locations: Location[] = ["All Locations", "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Accra"];
const dateFilters: DateFilter[] = ["Any Date", "Today", "This Weekend", "This Week", "This Month"];

const Events = () => {
  const [activeCategory, setActiveCategory] = useState<EventCategory>("All");
  const [selectedLocation, setSelectedLocation] = useState<Location>("All Locations");
  const [selectedDate, setSelectedDate] = useState<DateFilter>("Any Date");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const locationRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
        setLocationSearch("");
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = locations.filter((loc) => loc.toLowerCase().includes(locationSearch.toLowerCase())).slice(0, 4);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => { setSelectedLocation("Lagos"); setLocationOpen(false); setLocationSearch(""); },
        () => { setSelectedLocation("Lagos"); setLocationOpen(false); setLocationSearch(""); }
      );
    }
  };

  const filtered = allEvents.filter((e) => {
    const categoryMatch = activeCategory === "All" || e.category === activeCategory;
    const locationMatch = selectedLocation === "All Locations" || e.location === selectedLocation;
    const searchMatch = searchQuery === "" || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.organizer.toLowerCase().includes(searchQuery.toLowerCase()) || e.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && locationMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Search Banner */}
      <section className="bg-primary py-12 md:py-16">
        <div className="container px-4 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <a href="/"><ArrowLeft className="w-5 h-5" /></a>
            </Button>
            <h1 className="text-2xl md:text-4xl font-extrabold text-primary-foreground">
              Find your next experience
            </h1>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events, organizers, or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-background text-foreground text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            {/* Location dropdown */}
            <div className="relative" ref={locationRef}>
              <button
                onClick={() => { setLocationOpen(!locationOpen); setDateOpen(false); }}
                className="h-12 px-4 rounded-xl bg-background text-foreground text-sm font-medium flex items-center gap-2 min-w-[180px] hover:bg-secondary transition-colors"
              >
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {selectedLocation === "All Locations" ? "Choose location" : selectedLocation}
                <ChevronDown className={`w-4 h-4 ml-auto text-muted-foreground transition-transform ${locationOpen ? "rotate-180" : ""}`} />
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
                    <div className="p-2 border-b border-border">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10">
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
                    <button
                      onClick={handleUseMyLocation}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-primary hover:bg-accent/50 font-medium border-b border-border transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Use my precise location
                    </button>
                    {filteredLocations.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => { setSelectedLocation(loc); setLocationOpen(false); setLocationSearch(""); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                          selectedLocation === loc ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
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

            {/* Date dropdown */}
            <div className="relative" ref={dateRef}>
              <button
                onClick={() => { setDateOpen(!dateOpen); setLocationOpen(false); }}
                className="h-12 px-4 rounded-xl bg-background text-foreground text-sm font-medium flex items-center gap-2 min-w-[160px] hover:bg-secondary transition-colors"
              >
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {selectedDate}
                <ChevronDown className={`w-4 h-4 ml-auto text-muted-foreground transition-transform ${dateOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {dateOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 z-50 w-[200px] bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                  >
                    {dateFilters.map((df) => (
                      <button
                        key={df}
                        onClick={() => { setSelectedDate(df); setDateOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                          selectedDate === df ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        }`}
                      >
                        {df}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs + Results */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-8">
          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filtered.length} event{filtered.length !== 1 ? "s" : ""} found
              {selectedLocation !== "All Locations" && <span> in <span className="font-semibold text-foreground">{selectedLocation}</span></span>}
              {activeCategory !== "All" && <span> • <span className="font-semibold text-foreground">{activeCategory}</span></span>}
            </p>
          </div>

          {/* Events Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${selectedLocation}-${searchQuery}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-lg border border-border">
                      {event.date}
                    </div>
                    {event.verified && (
                      <span className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                    <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-lg border border-border">
                      {event.price}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-card-foreground leading-tight">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{event.fullDate} · {event.time}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.venue}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">by {event.organizer}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="flex -space-x-1">
                          <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
                          <div className="w-4 h-4 rounded-full bg-muted-foreground/20" />
                          <div className="w-4 h-4 rounded-full bg-muted-foreground/15" />
                        </div>
                        <span>{event.vibing} vibing</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No events found</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Try adjusting your filters or search to find what you're looking for.
              </p>
              <Button
                variant="outline"
                className="rounded-full mt-6"
                onClick={() => { setActiveCategory("All"); setSelectedLocation("All Locations"); setSearchQuery(""); setSelectedDate("Any Date"); }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
