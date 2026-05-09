import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Search, ArrowLeft, Users, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageCard from "@/components/bloov/PackageCard";
import { usePackages } from "@/hooks/usePackages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const VIBES = ["luxury", "intimate", "viral", "traditional", "afrobeats", "minimal", "festival"];
const CITIES = ["All", "Lagos", "Abuja", "Accra", "Port Harcourt", "Ibadan"];

const BloovExperiences = () => {
  const { data: packages = [], isLoading } = usePackages();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [city, setCity] = useState("All");
  const [vibe, setVibe] = useState<string | null>(null);
  const [size, setSize] = useState<number[]>([300]);

  const categories = useMemo(
    () => Array.from(new Set(packages.map((p) => p.category))),
    [packages],
  );

  const filtered = packages.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (search && !`${p.title} ${p.description ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (vibe && !`${p.title} ${p.description ?? ""}`.toLowerCase().includes(vibe)) return false;
    // Filter by guest size — show packages within ±60% of the chosen size.
    const target = size[0];
    if (p.guest_capacity > target * 1.8 || p.guest_capacity < target * 0.4) return false;
    return true;
  });

  // Group by category for the "multiple options per event type" UX
  const grouped = categories
    .filter((c) => category === "all" || c === category)
    .map((c) => ({
      category: c,
      packages: filtered.filter((p) => p.category === c),
    }))
    .filter((g) => g.packages.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-accent/15 to-transparent pointer-events-none" />
        <div className="container relative max-w-6xl px-4 py-14 md:py-20">
          <Button asChild variant="ghost" size="sm" className="gap-1 mb-4">
            <Link to="/bloov-service"><ArrowLeft className="h-4 w-4" /> Bloov Service</Link>
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-bold mb-5">
              <Sparkles className="h-3.5 w-3.5" /> PRE-BUILT EXPERIENCES
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[0.95] mb-4">
              Pick a vibe. <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Customize everything.
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Curated event blueprints with multiple options per type. Tune by taste, guest size, and city — then make it yours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="container max-w-6xl px-4 -mt-2 mb-6">
        <div className="rounded-3xl border border-border bg-card p-5 grid gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Wedding, festival, brunch..." className="pl-9" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Event type</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCategory("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${category === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Guest size: <span className="text-foreground">{size[0]}</span>
              </label>
              <Slider value={size} onValueChange={setSize} min={20} max={2000} step={10} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> City
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${city === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" /> Vibe
              </label>
              <div className="flex flex-wrap gap-1.5">
                {VIBES.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVibe(vibe === v ? null : v)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${vibe === v ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container max-w-6xl px-4 pb-12">
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[360px] rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">No experiences match those filters. Try widening your search.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map((g) => (
              <div key={g.category}>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{g.category}</p>
                    <h2 className="text-2xl md:text-3xl font-extrabold capitalize">
                      {g.category} blueprints · {g.packages.length} option{g.packages.length === 1 ? "" : "s"}
                    </h2>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {g.packages.map((p) => (
                    <PackageCard key={p.id} pkg={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default BloovExperiences;
