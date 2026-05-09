import { motion } from "framer-motion";
import { Search, Sparkles, Heart, Bot, Store, ArrowRight, Layers, SlidersHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useVendorCategories, useVendors } from "@/hooks/useVendors";
import { usePackages } from "@/hooks/usePackages";
import VendorBento from "@/components/bloov/VendorBento";
import CategoryChipRow from "@/components/bloov/CategoryChipRow";
import PackageCard from "@/components/bloov/PackageCard";
import AmbientGlow from "@/components/ui/AmbientGlow";

const BloovService = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { data: categories = [] } = useVendorCategories();
  const { data: vendors = [] } = useVendors();
  const { data: packages = [] } = usePackages();

  const categoryIdBySlug = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.slug, c.id])),
    [categories],
  );

  const filteredVendors = useMemo(() => {
    let list = vendors;
    if (activeCategory) {
      const id = categoryIdBySlug[activeCategory];
      if (id) list = list.filter((v) => v.category_id === id);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((v) =>
        `${v.business_name} ${v.tagline ?? ""} ${v.city ?? ""}`.toLowerCase().includes(q),
      );
    }
    return list;
  }, [vendors, search, activeCategory, categoryIdBySlug]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <AmbientGlow />
        <div className="container relative max-w-6xl px-4 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 text-accent-foreground text-xs font-bold mb-5">
              <Sparkles className="h-3.5 w-3.5" /> BLOOV SERVICE
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[0.95] mb-4">
              Curate your <br />
              <span className="text-gradient-brand">event lineup.</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mb-7">
              Search verified vendors, browse curated categories, or skip ahead with pre-built experiences.
            </p>

            {/* Glass search bar */}
            <div className="glass-panel rounded-2xl p-2 flex items-center gap-2 max-w-2xl">
              <div className="flex items-center flex-1 px-3">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  placeholder="Search vendors, venues, services..."
                  className="w-full h-12 px-3 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm md:text-base"
                />
              </div>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex h-12 rounded-xl font-bold text-muted-foreground"
                onClick={() => setActiveCategory(null)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                Filters
              </Button>
              <Button className="btn-gradient-brand h-12 rounded-xl font-bold px-5 text-primary-foreground border-0">
                Search
              </Button>
            </div>

            {/* Category chips */}
            <div className="mt-5">
              <CategoryChipRow
                categories={categories}
                activeSlug={activeCategory}
                onSelect={setActiveCategory}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured vendors bento */}
      <section className="container max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-xs font-bold text-primary mb-1">FEATURED</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {activeCategory
                ? categories.find((c) => c.slug === activeCategory)?.name ?? "Vendors"
                : "Top vendors"}
            </h2>
          </div>
          {filteredVendors.length > 0 && (
            <Button
              variant="outline"
              className="rounded-xl font-bold"
              onClick={() =>
                navigate(activeCategory ? `/bloov-service/category/${activeCategory}` : "/bloov-service")
              }
            >
              See all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
        {filteredVendors.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center">
            <p className="text-muted-foreground">No vendors match your search yet.</p>
          </div>
        ) : (
          <VendorBento vendors={filteredVendors.slice(0, 7)} />
        )}
      </section>

      {/* Pre-built teaser strip */}
      <section className="container max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-xs font-bold text-primary mb-1">PRE-BUILT EXPERIENCES</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Featured blueprints</h2>
          </div>
          <Button variant="outline" className="rounded-xl font-bold" onClick={() => navigate("/bloov-service/experiences")}>
            See all <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.slice(0, 3).map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      </section>

      {/* Two ways to plan (secondary) */}
      <section className="container max-w-6xl px-4 py-10 grid md:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ y: -4 }}
          className="text-left rounded-3xl p-7 glass-panel"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-bold mb-4">
            <Store className="h-3 w-3" /> HIRE & BOOK
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Hire vendors. Book venues.</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Browse curated vendors across every category — DJs, planners, decor, security, and more.
          </p>
          <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
            Browse vendors <ArrowRight className="h-4 w-4" />
          </div>
        </motion.div>

        <motion.button
          whileHover={{ y: -4 }}
          onClick={() => navigate("/bloov-service/experiences")}
          className="text-left rounded-3xl p-7 glass-panel glass-active"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/20 text-accent-foreground text-[11px] font-bold mb-4">
            <Layers className="h-3 w-3" /> PRE-BUILT
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Pre-built experiences</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Multiple options for every event type. Tune by guest size, city, and vibe.
          </p>
          <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
            Explore experiences <ArrowRight className="h-4 w-4" />
          </div>
        </motion.button>
      </section>

      {/* Wedding planning + AI concierge */}
      <section className="container max-w-6xl px-4 py-12 grid md:grid-cols-2 gap-4">
        <div className="rounded-3xl glass-panel p-8">
          <Heart className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-2xl font-extrabold mb-2">Wedding Planning Mode</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Full traditional and luxury wedding execution — planners, decor, catering, and more.
          </p>
          <Button className="rounded-xl font-bold" onClick={() => navigate("/bloov-service/category/traditional")}>
            Explore wedding vendors
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-3xl glass-panel p-8">
          <Bot className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-2xl font-extrabold mb-2">AI Event Concierge</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Ask anything: "What vendors fit my budget?" "What package for 300 guests?"
          </p>
          <Button variant="outline" className="rounded-xl font-bold" disabled>
            Coming soon
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BloovService;
