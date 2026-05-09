import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Megaphone, ArrowRight, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEventIdeas } from "@/hooks/useEventIdeas";
import EventIdeaCard from "@/components/bloov/EventIdeaCard";

const BloovCreate = () => {
  const navigate = useNavigate();
  const { data: ideas = [], isLoading } = useEventIdeas();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        <div className="container relative max-w-6xl px-4 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 backdrop-blur text-primary text-xs font-bold mb-5">
              <Sparkles className="h-3.5 w-3.5" /> BLOOV CREATE · BETA
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[0.95] mb-5">
              Dream it. <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Launch it. Sell it out.
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mb-8">
              The creator-first event idea engine. Turn an idea into a sold-out experience —
              from concept to checkout in one flow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-xl font-bold gap-2" onClick={() => navigate("/create-event")}>
                <Wand2 className="h-4 w-4" /> Create New Event Idea
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl font-bold" onClick={() => navigate("/bloov-service")}>
                Browse Bloov Service
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending ideas */}
      <section className="container max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary mb-2">
              <TrendingUp className="h-3.5 w-3.5" /> TRENDING NOW
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Viral event ideas</h2>
          </div>
        </div>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[5/4] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ideas.slice(0, 8).map((idea) => (
              <EventIdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </section>

      {/* Earnings strip */}
      <section className="container max-w-6xl px-4 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-primary to-accent p-8 md:p-12 text-primary-foreground">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight">
                Top creators earn ₦4M+ per event
              </h3>
              <p className="text-primary-foreground/90 max-w-md">
                We give you the tools, the audience, and the ecosystem — Bloov Service vendors,
                Flex-it installments, and TribeMint affiliates included.
              </p>
            </div>
            <Button size="lg" variant="secondary" className="rounded-xl font-bold gap-2 justify-self-start md:justify-self-end" onClick={() => navigate("/create-event")}>
              Start now <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* City trends + sponsorship teaser */}
      <section className="container max-w-6xl px-4 py-12 grid md:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-card border border-border p-8">
          <div className="text-xs font-bold text-primary mb-2">UPCOMING CITY TRENDS</div>
          <h3 className="text-2xl font-extrabold mb-4">Lagos · Abuja · Accra</h3>
          <div className="space-y-2">
            {[
              { city: "Lagos", tag: "Rooftop nightlife", score: 96 },
              { city: "Abuja", tag: "Silent disco", score: 88 },
              { city: "Accra", tag: "Creator brunches", score: 81 },
            ].map((c) => (
              <div key={c.city} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="font-bold text-sm">{c.city}</p>
                  <p className="text-xs text-muted-foreground">{c.tag}</p>
                </div>
                <span className="text-sm font-extrabold text-primary">{c.score}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/30 to-primary/30 p-8">
          <Megaphone className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-2xl font-extrabold mb-2">Sponsorship Marketplace</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Connect with brands ready to sponsor your event. Cash, services, and product partners — coming soon.
          </p>
          <Button variant="outline" className="rounded-xl font-bold" disabled>
            Coming in Phase 4
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BloovCreate;
