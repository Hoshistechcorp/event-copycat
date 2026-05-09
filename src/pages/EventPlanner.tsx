import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import LocationPicker from "@/components/LocationPicker";
import { useVendorCategories, useVendors } from "@/hooks/useVendors";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { routeGateway } from "@/lib/paymentRouter";
import { Sparkles, Loader2, ArrowLeft, ArrowRight, Check, Pencil, Save, Send, Clock } from "lucide-react";

const EVENT_TYPES = ["Wedding", "Concert", "Birthday", "Corporate / Conference", "Private Party", "Festival", "Brunch"];

const REC: Record<string, string[]> = {
  Wedding: ["venues", "planners", "decorators", "caterers", "photographers", "djs", "florists", "makeup"],
  Concert: ["venues", "djs", "lighting", "security", "videographers", "photographers"],
  Birthday: ["venues", "decorators", "djs", "caterers", "photographers"],
  "Corporate / Conference": ["venues", "caterers", "ushers", "mcs", "videographers", "lighting"],
  "Private Party": ["venues", "djs", "bartenders", "decorators", "photographers"],
  Festival: ["venues", "djs", "lighting", "security", "caterers", "videographers"],
  Brunch: ["caterers", "venues", "photographers", "decorators"],
};

const OFFSETS_HOURS: Record<string, number> = {
  venues: -8, decorators: -6, florists: -5, caterers: -3, bartenders: -2,
  lighting: -4, djs: -1, mcs: -1, photographers: -1, videographers: -1,
  security: -2, ushers: -1, planners: -10, makeup: -6, traditional: -2,
};

const EventPlanner = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const draftId = params.get("draft");
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { data: categories = [] } = useVendorCategories();
  const { data: allVendors = [] } = useVendors();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [hydrated, setHydrated] = useState(!draftId);

  const [data, setData] = useState({
    title: "",
    type: "Wedding",
    date: "",
    venue: "",
    loc: { country: "", city: "" },
    guests: 100,
    budget: 10000,
    vibe: "",
    description: "",
    selectedVendors: {} as Record<string, string[]>,
  });

  // Hydrate from existing draft
  useEffect(() => {
    if (!draftId || !user || hydrated) return;
    (async () => {
      const { data: ev } = await supabase.from("events").select("*").eq("id", draftId).maybeSingle();
      if (ev) {
        const [city, country] = (ev.venue_address || "").split(",").map((s: string) => s.trim());
        setData((d) => ({
          ...d,
          title: ev.title,
          description: ev.description ?? "",
          date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : "",
          venue: ev.venue ?? "",
          loc: { country: country ?? "", city: city ?? "" },
        }));
        const { data: assigns } = await supabase.from("event_vendor_assignments").select("category_slug,vendor_id").eq("event_id", draftId);
        if (assigns) {
          const sel: Record<string, string[]> = {};
          for (const a of assigns) {
            if (!a.category_slug) continue;
            sel[a.category_slug] = sel[a.category_slug] ?? [];
            if (a.vendor_id) sel[a.category_slug].push(a.vendor_id);
          }
          setData((d) => ({ ...d, selectedVendors: sel }));
        }
      }
      setHydrated(true);
    })();
  }, [draftId, user, hydrated]);

  const recCats = REC[data.type] ?? [];
  const gw = routeGateway(currency.code);

  const toggleVendor = (slug: string, vid: string) => {
    setData((d) => {
      const cur = d.selectedVendors[slug] ?? [];
      return { ...d, selectedVendors: { ...d.selectedVendors, [slug]: cur.includes(vid) ? cur.filter((v) => v !== vid) : [...cur, vid] } };
    });
  };

  const totalSelected = Object.values(data.selectedVendors).flat().length;

  // Auto-generated timeline preview
  const timelinePreview = useMemo(() => {
    const baseDate = data.date ? new Date(data.date) : new Date(Date.now() + 30 * 24 * 3600 * 1000);
    return recCats
      .map((slug) => {
        const offset = OFFSETS_HOURS[slug] ?? -1;
        const at = new Date(baseDate.getTime() + offset * 3600 * 1000);
        const cat = categories.find((c) => c.slug === slug);
        const ids = data.selectedVendors[slug] ?? [];
        const vendors = ids.map((id) => allVendors.find((v) => v.id === id)?.business_name).filter(Boolean) as string[];
        return { slug, label: cat?.name || slug, at, offset, vendors };
      })
      .sort((a, b) => a.at.getTime() - b.at.getTime());
  }, [recCats, data.date, data.selectedVendors, categories, allVendors]);

  const persist = async (status: "draft" | "planned") => {
    if (!user) { navigate("/signin"); return; }
    setSaving(status === "draft" ? "draft" : "publish");
    try {
      const eventDate = data.date ? new Date(data.date) : new Date(Date.now() + 30 * 24 * 3600 * 1000);
      const payload = {
        host_id: user.id,
        title: data.title || `${data.type} for ${data.guests} guests`,
        description: data.description,
        date: eventDate.toISOString(),
        venue: data.venue || `${data.loc.city || "TBD"}`,
        venue_address: data.loc.city ? `${data.loc.city}, ${data.loc.country}` : null,
        category: data.type.toLowerCase().split(" ")[0],
        status,
      };

      let evId = draftId;
      if (draftId) {
        const { error } = await supabase.from("events").update(payload).eq("id", draftId);
        if (error) throw error;
        await supabase.from("event_vendor_assignments").delete().eq("event_id", draftId);
      } else {
        const { data: ev, error } = await supabase.from("events").insert(payload).select().single();
        if (error) throw error;
        evId = ev.id;
      }

      const assignments: any[] = [];
      let order = 0;
      for (const slug of recCats) {
        const ids = data.selectedVendors[slug] ?? [];
        const offset = OFFSETS_HOURS[slug] ?? -1;
        const scheduled = new Date(eventDate.getTime() + offset * 3600 * 1000);
        if (ids.length === 0) {
          assignments.push({ event_id: evId, category_slug: slug, scheduled_at: scheduled.toISOString(), duration_minutes: 60, sort_order: order++, status });
        } else {
          for (const vid of ids) {
            assignments.push({ event_id: evId, vendor_id: vid, category_slug: slug, scheduled_at: scheduled.toISOString(), duration_minutes: 60, sort_order: order++, status });
          }
        }
      }
      if (assignments.length > 0) {
        const { error: aerr } = await supabase.from("event_vendor_assignments").insert(assignments);
        if (aerr) throw aerr;
      }

      if (status === "draft") {
        toast({ title: "Draft saved", description: "Find it under Dashboard → My Plans." });
        navigate("/dashboard?tab=plans");
      } else {
        toast({ title: "Plan generated", description: `${assignments.length} timeline slots created.` });
        navigate(`/events/${evId}/timeline`);
      }
    } catch (e: any) {
      toast({ title: "Could not save", description: e.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const StepNav = (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border gap-2 flex-wrap">
      <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      {step < 3 ? (
        <Button onClick={() => setStep((s) => s + 1)} className="font-bold">Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
      ) : (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => persist("draft")} disabled={!!saving} className="font-bold">
            {saving === "draft" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Draft
          </Button>
          <Button onClick={() => persist("planned")} disabled={!!saving} className="font-bold">
            {saving === "publish" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />} Generate & Publish Plan
          </Button>
        </div>
      )}
    </div>
  );

  // Quick-edit summary card visible from step 1 onward
  const DraftSummary = step > 0 && (
    <div className="rounded-2xl bg-card/60 backdrop-blur border border-border p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Draft summary</h4>
        {draftId && <Badge variant="secondary" className="text-[10px]">Editing</Badge>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {[
          { label: "Type", val: data.type, step: 0 },
          { label: "Title", val: data.title || "—", step: 0 },
          { label: "Date", val: data.date ? new Date(data.date).toLocaleDateString() : "TBD", step: 0 },
          { label: "Guests", val: String(data.guests), step: 0 },
          { label: "Location", val: data.loc.city ? `${data.loc.city}` : "TBD", step: 1 },
          { label: "Venue", val: data.venue || "—", step: 1 },
          { label: "Vibe", val: data.vibe || "—", step: 1 },
          { label: "Budget", val: `${currency.symbol}${data.budget.toLocaleString()}`, step: 0 },
        ].map((f) => (
          <button key={f.label} onClick={() => setStep(f.step)} className="text-left p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
            <div className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">{f.label} <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100" /></div>
            <div className="font-bold truncate">{f.val}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl px-4 py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent-foreground text-xs font-bold mb-4">
          <Sparkles className="h-3 w-3" /> EVENT PLANNER
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{draftId ? "Edit your plan" : "Build a full-service plan"}</h1>
        <p className="text-muted-foreground mb-6">Configure the basics, pick your vendors, and we'll generate a timeline.</p>

        <div className="flex items-center gap-2 mb-8">
          {["Basics", "Venue & vibe", "Vendors", "Review"].map((label, i) => (
            <div key={label} className={`flex-1 h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>

        {DraftSummary}

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label>Event title</Label>
              <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} placeholder="Summer Rooftop Wedding" />
            </div>
            <div>
              <Label>Type</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {EVENT_TYPES.map((t) => (
                  <button key={t} onClick={() => setData({ ...data, type: t })} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${data.type === t ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="datetime-local" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Guests</Label>
                <Input type="number" value={data.guests} onChange={(e) => setData({ ...data, guests: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Budget ({currency.code})</Label>
                <Input type="number" value={data.budget} onChange={(e) => setData({ ...data, budget: Number(e.target.value) })} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Location</Label>
              <LocationPicker country={data.loc.country} city={data.loc.city} onChange={(loc) => setData({ ...data, loc })} />
            </div>
            <div>
              <Label>Venue (optional)</Label>
              <Input value={data.venue} onChange={(e) => setData({ ...data, venue: e.target.value })} placeholder="The Rooftop, etc." />
            </div>
            <div>
              <Label>Vibe</Label>
              <Input value={data.vibe} onChange={(e) => setData({ ...data, vibe: e.target.value })} placeholder="Luxury minimal / festival / intimate…" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">Pick vendors per recommended category. Skip any to leave open slots in your timeline.</p>
            {recCats.map((slug) => {
              const cat = categories.find((c) => c.slug === slug);
              const matching = allVendors.filter((v) => v.vendor_categories.slug === slug && (!data.loc.city || (v.city || "").toLowerCase().includes(data.loc.city.toLowerCase())));
              const fallback = allVendors.filter((v) => v.vendor_categories.slug === slug);
              const list = matching.length > 0 ? matching : fallback;
              return (
                <div key={slug} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold capitalize">{cat?.name || slug}</h3>
                    <Badge variant="secondary" className="text-[10px]">{(data.selectedVendors[slug] ?? []).length} picked</Badge>
                  </div>
                  {list.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No vendors yet in this category.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {list.slice(0, 6).map((v) => {
                        const sel = (data.selectedVendors[slug] ?? []).includes(v.id);
                        return (
                          <button key={v.id} onClick={() => toggleVendor(slug, v.id)} className={`text-left p-3 rounded-xl border text-xs ${sel ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"}`}>
                            <div className="font-bold flex items-center gap-1">{v.business_name} {sel && <Check className="h-3 w-3 text-primary" />}</div>
                            <div className="text-[10px] text-muted-foreground">{v.city || "Global"} • ★ {v.rating}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-card border border-border p-5">
              <h3 className="font-extrabold mb-3">Plan summary</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-muted-foreground">Type</div><div>{data.type}</div>
                <div className="text-muted-foreground">Title</div><div>{data.title || "—"}</div>
                <div className="text-muted-foreground">Date</div><div>{data.date || "TBD"}</div>
                <div className="text-muted-foreground">Location</div><div>{data.loc.city ? `${data.loc.city}, ${data.loc.country}` : "TBD"}</div>
                <div className="text-muted-foreground">Guests</div><div>{data.guests}</div>
                <div className="text-muted-foreground">Budget</div><div>{currency.symbol}{data.budget.toLocaleString()}</div>
                <div className="text-muted-foreground">Vendors selected</div><div>{totalSelected}</div>
                <div className="text-muted-foreground">Timeline slots</div><div>{recCats.length}</div>
                <div className="text-muted-foreground">Payment rail</div><div>{gw.label}</div>
              </div>
            </div>

            {/* Timeline preview */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="font-extrabold">Auto-generated timeline</h3>
              </div>
              <div className="relative pl-5 space-y-3">
                <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
                {timelinePreview.map((slot) => (
                  <div key={slot.slug} className="relative">
                    <div className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {slot.at.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · {slot.offset >= 0 ? `+${slot.offset}` : slot.offset}h
                    </div>
                    <div className="font-bold capitalize">{slot.label}</div>
                    {slot.vendors.length > 0 ? (
                      <div className="text-xs text-muted-foreground">{slot.vendors.join(", ")}</div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">Open slot — pick a vendor later</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Save as draft to keep editing, or publish to lock in the timeline and start booking vendors.</p>
          </div>
        )}

        {StepNav}
      </div>
      <Footer />
    </div>
  );
};

export default EventPlanner;
