import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Building2, Plus, Users, MapPin, ArrowRight, Megaphone } from "lucide-react";
import { useSponsorshipListings } from "@/hooks/useSponsorships";
import { useBrands } from "@/hooks/useBrands";
import { useCurrency } from "@/contexts/CurrencyContext";
import LocationPicker from "@/components/LocationPicker";

const EVENT_TYPES = ["Concert", "Wedding", "Festival", "Conference", "Nightlife", "Sports", "Brunch", "Tech"];

const Sponsorships = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [eventType, setEventType] = useState<string>("");
  const [loc, setLoc] = useState({ country: "", city: "" });
  const { data: listings = [], isLoading } = useSponsorshipListings({
    eventType: eventType || undefined,
    city: loc.city || undefined,
  });
  const { data: brands = [] } = useBrands();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent pointer-events-none" />
        <div className="container relative max-w-6xl px-4 py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-bold mb-5">
              <Megaphone className="h-3.5 w-3.5" /> SPONSORSHIP MARKETPLACE
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[0.95] mb-4">
              Where brands meet <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                unforgettable events.
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mb-7">
              Hosts list sponsorship opportunities. Brands tell us the events, audiences and budgets they want — we match.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-xl font-bold" onClick={() => navigate("/brand/setup")}>
                <Building2 className="h-4 w-4 mr-2" /> I'm a Brand
              </Button>
              <Button variant="outline" className="rounded-xl font-bold" onClick={() => navigate("/dashboard?tab=sponsorships")}>
                <Plus className="h-4 w-4 mr-2" /> List my event
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="container max-w-6xl px-4 py-6">
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <LocationPicker country={loc.country} city={loc.city} onChange={setLoc} />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEventType("")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${!eventType ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
            >All</button>
            {EVENT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setEventType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${eventType === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
              >{t}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Listings grid */}
      <section className="container max-w-6xl px-4 py-4">
        <h2 className="text-2xl font-extrabold mb-4">Open sponsorship opportunities</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">No matching listings yet. Be the first to publish one.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l) => (
              <motion.button
                key={l.id}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/sponsorships/listings/${l.id}`)}
                className="text-left rounded-2xl bg-card border border-border overflow-hidden"
              >
                {l.hero_image_url && <img src={l.hero_image_url} alt={l.title} className="w-full h-40 object-cover" />}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Users className="h-3 w-3" /> {l.audience_size.toLocaleString()} guests
                    {l.city && <><MapPin className="h-3 w-3 ml-2" /> {l.city}</>}
                  </div>
                  <h3 className="font-extrabold text-lg leading-tight">{l.title}</h3>
                  {l.event_type && <Badge variant="secondary" className="text-[10px]">{l.event_type}</Badge>}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">{formatPrice(String(l.asking_amount))}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* Brands looking to sponsor */}
      <section className="container max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-extrabold">Brands looking to sponsor</h2>
          <Button variant="outline" className="rounded-xl font-bold" onClick={() => navigate("/sponsorships/brands")}>
            See all <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        {brands.length === 0 ? (
          <p className="text-sm text-muted-foreground">No brand profiles yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {brands.slice(0, 4).map((b) => (
              <button
                key={b.id}
                onClick={() => navigate(`/sponsorships/brands/${b.id}`)}
                className="text-left rounded-2xl bg-card border border-border p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  {b.logo_url ? (
                    <img src={b.logo_url} alt={b.name} className="h-10 w-10 rounded-xl object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center font-bold text-primary">{b.name[0]}</div>
                  )}
                  <div>
                    <div className="font-bold text-sm">{b.name}</div>
                    <div className="text-[10px] text-muted-foreground">{b.industry || "Brand"}</div>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{b.description || "Looking for events to sponsor."}</div>
                <Badge variant="outline" className="text-[10px]">
                  Budget {formatPrice(String(b.budget_min))} – {formatPrice(String(b.budget_max))}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Sponsorships;
