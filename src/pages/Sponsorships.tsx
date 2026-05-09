import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Building2, Plus, Users, MapPin, ArrowRight, Megaphone, Search, Filter } from "lucide-react";
import { useSponsorshipListings } from "@/hooks/useSponsorships";
import { useBrands } from "@/hooks/useBrands";
import { useCurrency } from "@/contexts/CurrencyContext";
import LocationPicker from "@/components/LocationPicker";

const EVENT_TYPES = ["Concert", "Wedding", "Festival", "Conference", "Nightlife", "Sports", "Brunch", "Tech"];

const AUDIENCE_BUCKETS = [
  { label: "Any size", min: 0, max: Infinity },
  { label: "<100", min: 0, max: 100 },
  { label: "100–500", min: 100, max: 500 },
  { label: "500–2k", min: 500, max: 2000 },
  { label: "2k–10k", min: 2000, max: 10000 },
  { label: "10k+", min: 10000, max: Infinity },
];

type Sort = "newest" | "budget" | "audience";

const Sponsorships = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [eventType, setEventType] = useState<string>("");
  const [loc, setLoc] = useState({ country: "", city: "" });
  const [search, setSearch] = useState("");
  const [audienceIdx, setAudienceIdx] = useState(0);
  const [sort, setSort] = useState<Sort>("newest");
  const { data: listings = [], isLoading } = useSponsorshipListings({
    eventType: eventType || undefined,
    city: loc.city || undefined,
  });
  const { data: brands = [] } = useBrands();

  const filtered = useMemo(() => {
    const bucket = AUDIENCE_BUCKETS[audienceIdx];
    let l = listings.filter((x) => x.audience_size >= bucket.min && x.audience_size < bucket.max);
    if (search) {
      const q = search.toLowerCase();
      l = l.filter((x) =>
        x.title.toLowerCase().includes(q) ||
        (x.event_type || "").toLowerCase().includes(q) ||
        (x.description || "").toLowerCase().includes(q)
      );
    }
    if (loc.country) l = l.filter((x) => (x.country || "").toLowerCase().includes(loc.country.toLowerCase()));
    if (sort === "budget") l = [...l].sort((a, b) => Number(b.asking_amount) - Number(a.asking_amount));
    if (sort === "audience") l = [...l].sort((a, b) => b.audience_size - a.audience_size);
    return l;
  }, [listings, audienceIdx, search, loc.country, sort]);

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
              Search opportunities by event type, location, and audience size. Brands and hosts find each other in seconds.
            </p>

            {/* Big search */}
            <div className="relative max-w-2xl mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search opportunities, event types, brand fit…"
                className="pl-11 h-12 rounded-2xl bg-card/80 backdrop-blur border-border text-sm"
              />
            </div>

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
        <div className="rounded-3xl bg-card/60 backdrop-blur border border-border p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> FILTERS
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Location</label>
              <LocationPicker country={loc.country} city={loc.city} onChange={setLoc} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Audience size</label>
              <Select value={String(audienceIdx)} onValueChange={(v) => setAudienceIdx(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCE_BUCKETS.map((b, i) => (
                    <SelectItem key={b.label} value={String(i)}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Sort by</label>
              <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="budget">Highest budget</SelectItem>
                  <SelectItem value="audience">Largest audience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Event type</label>
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
        </div>
      </section>

      {/* Listings grid */}
      <section className="container max-w-6xl px-4 py-4">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-extrabold">Open opportunities</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
        </div>
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground mb-3">No matching listings yet.</p>
            <Button variant="outline" onClick={() => navigate("/dashboard?tab=sponsorships")}>Create a listing</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((l) => (
              <motion.button
                key={l.id}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/sponsorships/listings/${l.id}`)}
                className="text-left rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors"
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
