import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Users } from "lucide-react";
import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import event4 from "@/assets/event-4.jpg";
import event5 from "@/assets/event-5.jpg";
import event6 from "@/assets/event-6.jpg";

type EventCategory = "All" | "Music" | "Parties" | "Workshops";

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
}

const events: EventItem[] = [
  { id: 1, title: "Vibes & Grills 3.0", organizer: "The Grill Master", date: "OCT 12", price: "₦5,000", image: event1, vibing: "120+", verified: true, category: "Parties" },
  { id: 2, title: "Tech Mixer Lagos", organizer: "Lagos Tech Hub", date: "OCT 15", price: "Free", image: event2, vibing: "85+", verified: false, category: "Workshops" },
  { id: 3, title: "Sip & Paint Night", organizer: "Art Studio X", date: "OCT 18", price: "₦7,500", image: event3, vibing: "45+", verified: false, category: "Workshops" },
  { id: 4, title: "Outdoor Cinema: Classics", organizer: "Park View Screens", date: "OCT 20", price: "₦3,000", image: event4, vibing: "200+", verified: true, category: "Parties" },
  { id: 5, title: "Comedy Roast Night", organizer: "Lagos Laughs", date: "OCT 22", price: "₦10,000", image: event5, vibing: "150+", verified: false, category: "Music" },
  { id: 6, title: "Morning Yoga Session", organizer: "Flow with Tola", date: "OCT 23", price: "Free", image: event6, vibing: "30+", verified: false, category: "Workshops" },
];

const tabs: EventCategory[] = ["All", "Music", "Parties", "Workshops"];

const EventsSection = () => {
  const [active, setActive] = useState<EventCategory>("All");
  const filtered = active === "All" ? events : events.filter((e) => e.category === active);

  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Discover Experiences
          </h2>
          <p className="text-muted-foreground text-lg">
            Handpicked events for you in Lagos & beyond.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                active === tab
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
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
              <div
                key={event.id}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-lg">
                    {event.date}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {event.verified && (
                      <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-lg">
                    {event.price}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-card-foreground">{event.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">by {event.organizer}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{event.vibing} vibing</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-10">
          <Button variant="outline" className="rounded-full px-8 font-semibold">
            View All Events
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
