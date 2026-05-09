import { motion } from "framer-motion";
import { Search, Sparkles, Heart, Bot, Store, ArrowRight, Layers } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useVendorCategories, useVendors } from "@/hooks/useVendors";
import { usePackages } from "@/hooks/usePackages";
import CategoryGrid from "@/components/bloov/CategoryGrid";
import VendorCard from "@/components/bloov/VendorCard";
import PackageCard from "@/components/bloov/PackageCard";

const BloovService = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: categories = [] } = useVendorCategories();
  const { data: vendors = [] } = useVendors();
  const { data: packages = [] } = usePackages();

  const filteredVendors = search
    ? vendors.filter((v) =>
        `${v.business_name} ${v.tagline ?? ""} ${v.city ?? ""}`.toLowerCase().includes(search.toLowerCase()),
      )
    : vendors;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-primary/15 to-transparent pointer-events-none" />
        <div className="container relative max-w-6xl px-4 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 text-accent-foreground text-xs font-bold mb-5">
              <Sparkles className="h-3.5 w-3.5" /> BLOOV SERVICE
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[0.95] mb-4">
              Two ways to plan. <br />
              <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                One operating system.
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mb-7">
              Hire vendors and book venues à la carte, or skip ahead with pre-built experiences you can customize end-to-end.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Two use case cards */}
      <section className="container max-w-6xl px-4 -mt-4 mb-12 grid md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ y: -4 }}
          onClick={() => {}}
          className="text-left rounded-3xl p-7 bg-gradient-to-br from-card to-secondary/40 border border-border"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-bold mb-4">
            <Store className="h-3 w-3" /> HIRE & BOOK
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Hire vendors. Book venues.</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Browse 16 categories of curated vendors. Build your own line-up — DJs, planners, decor, security, and more.
          </p>
          <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
            Browse vendors <ArrowRight className="h-4 w-4" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ y: -4 }}
          onClick={() => navigate("/bloov-service/experiences")}
          className="text-left rounded-3xl p-7 bg-gradient-to-br from-primary/20 via-accent/15 to-card border border-border"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/20 text-accent-foreground text-[11px] font-bold mb-4">
            <Layers className="h-3 w-3" /> PRE-BUILT
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Pre-built experiences</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Multiple options for every event type — weddings, festivals, corporate, nightlife. Tune by guest size, city, and vibe.
          </p>
          <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
            Explore experiences <ArrowRight className="h-4 w-4" />
          </div>
        </motion.button>
      </section>

      {/* Hire vendors workspace */}
      <section className="container max-w-6xl px-4 py-4">
        <div className="relative max-w-xl mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search vendors, venues..."
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-5">Browse by category</h2>
        <CategoryGrid categories={categories} />
      </section>

      {/* Featured vendors */}
      <section className="container max-w-6xl px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-5">Featured vendors</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredVendors.slice(0, 8).map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
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

      {/* Wedding planning + AI concierge */}
      <section className="container max-w-6xl px-4 py-12 grid md:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 p-8 border border-border">
          <Heart className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-2xl font-extrabold mb-2">Wedding Planning Mode</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Full traditional and luxury wedding execution — Alaga, Aso-Ebi, planners, decor, catering, and more.
          </p>
          <Button className="rounded-xl font-bold" onClick={() => navigate("/bloov-service/category/traditional")}>
            Explore traditional vendors
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-8">
          <Bot className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-2xl font-extrabold mb-2">AI Event Concierge</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Ask anything: "What vendors fit my budget?" "What package for 300 guests?" Coming in Phase 14.
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
