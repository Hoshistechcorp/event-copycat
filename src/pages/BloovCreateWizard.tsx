import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useVendors } from "@/hooks/useVendors";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, ArrowRight, Check, Loader2, Music, Briefcase, Heart, PartyPopper,
  Cake, GraduationCap, Sparkles, Wand2, MapPin, CalendarDays, Star, Plus, Trash2,
} from "lucide-react";

interface EventType {
  id: string;
  label: string;
  icon: any;
  recommended: string[]; // category slugs
}

const EVENT_TYPES: EventType[] = [
  { id: "concert", label: "Concert / Live Show", icon: Music, recommended: ["venues", "djs", "lighting", "security", "videographers", "photographers"] },
  { id: "wedding", label: "Wedding", icon: Heart, recommended: ["planners", "decorators", "caterers", "photographers", "videographers", "djs", "mcs", "florists", "traditional", "makeup"] },
  { id: "party", label: "Private Party", icon: PartyPopper, recommended: ["venues", "djs", "bartenders", "decorators", "photographers"] },
  { id: "corporate", label: "Corporate / Conference", icon: Briefcase, recommended: ["venues", "caterers", "ushers", "mcs", "videographers", "lighting"] },
  { id: "birthday", label: "Birthday", icon: Cake, recommended: ["decorators", "djs", "caterers", "photographers", "venues"] },
  { id: "graduation", label: "Graduation / Brunch", icon: GraduationCap, recommended: ["caterers", "venues", "photographers", "decorators"] },
];

const STEPS = ["Event type", "Venue & date", "Build timeline", "Review"];

interface TimelineItem {
  vendorId: string;
  businessName: string;
  categorySlug: string;
  scheduledAt: string;
}

const BloovCreateWizard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: vendors = [] } = useVendors();

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) { navigate("/signin"); return null; }

  const recommendedSlugs = eventType?.recommended ?? [];
  const recommendedVendors = vendors.filter((v) => recommendedSlugs.includes(v.vendor_categories?.slug));

  const grouped = recommendedSlugs.map((slug) => ({
    slug,
    vendors: recommendedVendors.filter((v) => v.vendor_categories?.slug === slug),
  }));

  const addToTimeline = (vendorId: string, businessName: string, categorySlug: string) => {
    if (timeline.some((t) => t.vendorId === vendorId)) return;
    setTimeline([...timeline, { vendorId, businessName, categorySlug, scheduledAt: date || "" }]);
  };
  const removeFromTimeline = (vendorId: string) => setTimeline(timeline.filter((t) => t.vendorId !== vendorId));
  const updateScheduled = (vendorId: string, value: string) =>
    setTimeline(timeline.map((t) => (t.vendorId === vendorId ? { ...t, scheduledAt: value } : t)));

  const totalEstimate = timeline.reduce((acc, t) => {
    const v = vendors.find((x) => x.id === t.vendorId);
    return acc + (v ? Number(v.base_price) : 0);
  }, 0);

  const canNext = () => {
    if (step === 0) return !!eventType;
    if (step === 1) return !!title.trim() && !!venue.trim() && !!date;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const { data: ev, error } = await supabase
      .from("events")
      .insert({
        host_id: user.id,
        title: title.trim(),
        date,
        venue: venue.trim(),
        category: eventType?.label ?? "Other",
        status: "draft",
      })
      .select("id")
      .single();
    if (error || !ev) {
      toast({ title: "Could not save plan", description: error?.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }
    if (timeline.length > 0) {
      const rows = timeline.map((t, i) => ({
        event_id: ev.id,
        vendor_id: t.vendorId,
        category_slug: t.categorySlug,
        scheduled_at: t.scheduledAt || date,
        sort_order: i,
      }));
      await supabase.from("event_vendor_assignments").insert(rows);
    }
    toast({ title: "Execution plan saved", description: "Your draft event and timeline are ready." });
    navigate(`/edit-event/${ev.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => navigate("/bloov-create")}>
          <ArrowLeft className="h-4 w-4" /> Back to Bloov Create
        </Button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
            <Wand2 className="h-3.5 w-3.5" /> EVENT SETUP WIZARD
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{STEPS[step]}</h1>
          <p className="text-muted-foreground text-sm">Step {step + 1} of {STEPS.length}</p>
          <Progress value={((step + 1) / STEPS.length) * 100} className="mt-3 h-1.5" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {step === 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {EVENT_TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = eventType?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setEventType(t)}
                      className={`p-5 text-left rounded-2xl border transition-all ${active ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border bg-card hover:border-primary/40"}`}
                    >
                      <Icon className={`h-7 w-7 mb-3 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="font-bold">{t.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Suggests {t.recommended.length} vendor categories
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 max-w-xl">
                <div>
                  <Label htmlFor="title">Event title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lagos Rooftop Sessions" maxLength={200} />
                </div>
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="venue" className="pl-9" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue name or address" maxLength={300} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="date">Date & time</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="date" className="pl-9" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-secondary/50 p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Recommended for {eventType?.label}</p>
                    <p className="text-xs text-muted-foreground">Add vendors to your execution timeline. You can edit it anytime later.</p>
                  </div>
                </div>

                {grouped.map((g) => (
                  <div key={g.slug}>
                    <h3 className="font-bold capitalize mb-2">{g.slug}</h3>
                    {g.vendors.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-3 rounded-xl border border-dashed">No vendors available in this category yet.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {g.vendors.slice(0, 4).map((v) => {
                          const inTimeline = timeline.some((t) => t.vendorId === v.id);
                          return (
                            <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                              <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0">
                                {v.avatar_url && <img src={v.avatar_url} alt={v.business_name} className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{v.business_name}</p>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-primary text-primary" /> {Number(v.rating).toFixed(1)} · {formatPrice(String(v.base_price))}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant={inTimeline ? "secondary" : "default"}
                                className="rounded-lg"
                                onClick={() =>
                                  inTimeline
                                    ? removeFromTimeline(v.id)
                                    : addToTimeline(v.id, v.business_name, v.vendor_categories?.slug)
                                }
                              >
                                {inTimeline ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-border p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Event</p>
                  <p className="font-extrabold text-lg">{title}</p>
                  <p className="text-sm text-muted-foreground">{eventType?.label} · {venue} · {date && new Date(date).toLocaleString()}</p>
                </div>

                <div className="rounded-2xl border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold">Execution timeline ({timeline.length})</p>
                    <p className="text-sm font-bold text-primary">Est. {formatPrice(String(totalEstimate))}</p>
                  </div>
                  {timeline.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No vendors added. Go back to add some.</p>
                  ) : (
                    <div className="space-y-2">
                      {timeline.map((t) => (
                        <div key={t.vendorId} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{t.businessName}</p>
                            <p className="text-[11px] text-muted-foreground capitalize">{t.categorySlug}</p>
                          </div>
                          <Input
                            type="datetime-local"
                            value={t.scheduledAt}
                            onChange={(e) => updateScheduled(t.vendorId, e.target.value)}
                            className="w-56 h-9 text-xs"
                          />
                          <button onClick={() => removeFromTimeline(t.vendorId)} className="text-destructive hover:opacity-70">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  We'll save this as a draft event with your selected vendors attached. You can finish ticketing in the event editor.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button disabled={!canNext()} onClick={() => setStep((s) => s + 1)} className="rounded-xl font-bold">
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button disabled={submitting} onClick={handleSubmit} className="rounded-xl font-bold">
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save execution plan
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BloovCreateWizard;
