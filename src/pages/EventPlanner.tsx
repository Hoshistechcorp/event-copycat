import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Sparkles, Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";

const EVENT_TYPES = ["Wedding", "Concert", "Birthday", "Corporate / Conference", "Private Party", "Festival", "Brunch"];

// Recommended categories per event type (mirrors EventTimeline reasoning).
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
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { data: categories = [] } = useVendorCategories();
  const { data: allVendors = [] } = useVendors();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

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
    selectedVendors: {} as Record<string, string[]>, // category_slug -> vendor ids
  });

  const recCats = REC[data.type] ?? [];
  const gw = routeGateway(currency.code);

  const toggleVendor = (slug: string, vid: string) => {
    setData((d) => {
      const cur = d.selectedVendors[slug] ?? [];
      return { ...d, selectedVendors: { ...d.selectedVendors, [slug]: cur.includes(vid) ? cur.filter((v) => v !== vid) : [...cur, vid] } };
    });
  };

  const totalSelected = Object.values(data.selectedVendors).flat().length;

  const generate = async () => {
    if (!user) { navigate("/signin"); return; }
    setSaving(true);
    try {
      const eventDate = data.date ? new Date(data.date) : new Date(Date.now() + 30 * 24 * 3600 * 1000);
      const { data: ev, error } = await supabase.from("events").insert({
        host_id: user.id,
        title: data.title || `${data.type} for ${data.guests} guests`,
        description: data.description,
        date: eventDate.toISOString(),
        venue: data.venue || `${data.loc.city || "TBD"}`,
        venue_address: data.loc.city ? `${data.loc.city}, ${data.loc.country}` : null,
        category: data.type.toLowerCase().split(" ")[0],
        status: "draft",
      }).select().single();
      if (error) throw error;

      const assignments: any[] = [];
      let order = 0;
      for (const slug of recCats) {
        const ids = data.selectedVendors[slug] ?? [];
        const offset = OFFSETS_HOURS[slug] ?? -1;
        const scheduled = new Date(eventDate.getTime() + offset * 3600 * 1000);
        if (ids.length === 0) {
          assignments.push({ event_id: ev.id, category_slug: slug, scheduled_at: scheduled.toISOString(), duration_minutes: 60, sort_order: order++ });
        } else {
          for (const vid of ids) {
            assignments.push({ event_id: ev.id, vendor_id: vid, category_slug: slug, scheduled_at: scheduled.toISOString(), duration_minutes: 60, sort_order: order++ });
          }
        }
      }
      if (assignments.length > 0) {
        const { error: aerr } = await supabase.from("event_vendor_assignments").insert(assignments);
        if (aerr) throw aerr;
      }
      toast({ title: "Execution plan ready", description: `${assignments.length} timeline slots created.` });
      navigate(`/events/${ev.id}/timeline`);
    } catch (e: any) {
      toast({ title: "Could not generate plan", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const StepNav = (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
      <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      {step < 3 ? (
        <Button onClick={() => setStep((s) => s + 1)} className="font-bold">Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
      ) : (
        <Button onClick={generate} disabled={saving} className="font-bold">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Generate execution plan
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl px-4 py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent-foreground text-xs font-bold mb-4">
          <Sparkles className="h-3 w-3" /> EVENT PLANNER
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-1">Build a full-service plan</h1>
        <p className="text-muted-foreground mb-6">Configure the basics, pick your vendors, and we'll generate a timeline.</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["Basics", "Venue & vibe", "Vendors", "Review"].map((label, i) => (
            <div key={label} className={`flex-1 h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>

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
          <div className="space-y-4">
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
            <p className="text-xs text-muted-foreground">We'll create a draft event and timeline you can edit anytime.</p>
          </div>
        )}

        {StepNav}
      </div>
      <Footer />
    </div>
  );
};

export default EventPlanner;
