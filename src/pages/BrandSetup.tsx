import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMyBrand, useUpsertBrand } from "@/hooks/useBrands";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency, currencies } from "@/contexts/CurrencyContext";
import LocationPicker from "@/components/LocationPicker";
import { toast } from "@/hooks/use-toast";
import { Loader2, Building2 } from "lucide-react";

const EVENT_TYPES = ["Concert", "Wedding", "Festival", "Conference", "Nightlife", "Sports", "Brunch", "Tech", "Fashion", "Gaming"];
const AUDIENCES = ["Gen-Z", "Millennials", "Luxury", "Students", "Creators", "Professionals", "Families"];
const STYLES = ["Urban", "Festival", "Luxury", "Intimate", "Underground", "Arena", "Outdoor", "Rooftop"];

const BrandSetup = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: existing } = useMyBrand();
  const upsert = useUpsertBrand();
  const { currency } = useCurrency();

  const [form, setForm] = useState<any>({
    name: "", industry: "", description: "", website: "", logo_url: "",
    budget_min: 1000, budget_max: 25000, currency: currency.code,
    hq_country: "", hq_city: "",
    target_event_types: [] as string[],
    target_audience: [] as string[],
    preferred_styles: [] as string[],
    preferred_locations: [] as string[],
  });
  const [locInput, setLocInput] = useState({ country: "", city: "" });

  useEffect(() => { if (existing) setForm({ ...form, ...existing }); /* eslint-disable-next-line */ }, [existing]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!user) { navigate("/signin"); return null; }

  const toggle = (key: string, value: string) =>
    setForm((f: any) => ({ ...f, [key]: f[key].includes(value) ? f[key].filter((v: string) => v !== value) : [...f[key], value] }));

  const addLocation = () => {
    if (!locInput.city) return;
    const label = locInput.country ? `${locInput.city}, ${locInput.country}` : locInput.city;
    if (form.preferred_locations.includes(label)) return;
    setForm({ ...form, preferred_locations: [...form.preferred_locations, label] });
    setLocInput({ country: "", city: "" });
  };

  const submit = async () => {
    try {
      await upsert.mutateAsync({ ...form, id: existing?.id, is_published: true });
      toast({ title: "Brand profile saved", description: "Hosts can now match you with relevant events." });
      navigate("/sponsorships");
    } catch (e: any) {
      toast({ title: "Could not save", description: e.message, variant: "destructive" });
    }
  };

  const Chip = ({ active, label, onClick }: any) => (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>{label}</button>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl px-4 py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold mb-4">
          <Building2 className="h-3 w-3" /> BRAND PROFILE
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Tell us what you sponsor</h1>
        <p className="text-muted-foreground mb-8">We use this to match you to events that fit your audience, budget and style.</p>

        <div className="space-y-6">
          <section className="space-y-3">
            <Label>Brand name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Beverages" />
            <Label>Industry</Label>
            <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Beverage / Fashion / Tech…" />
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Who you are and what you're looking for in event partners." />
            <Label>Website</Label>
            <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
            <Label>Logo URL</Label>
            <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
          </section>

          <section className="space-y-3">
            <Label>Headquarters</Label>
            <LocationPicker country={form.hq_country || ""} city={form.hq_city || ""} onChange={({ country, city }) => setForm({ ...form, hq_country: country, hq_city: city })} />
          </section>

          <section className="space-y-3">
            <Label>Sponsorship budget window</Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-[11px] text-muted-foreground mb-1">Min</div>
                <Input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: Number(e.target.value) })} />
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground mb-1">Max</div>
                <Input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: Number(e.target.value) })} />
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground mb-1">Currency</div>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section>
            <Label>Target event types</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EVENT_TYPES.map((t) => <Chip key={t} label={t} active={form.target_event_types.includes(t)} onClick={() => toggle("target_event_types", t)} />)}
            </div>
          </section>

          <section>
            <Label>Target audience</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {AUDIENCES.map((t) => <Chip key={t} label={t} active={form.target_audience.includes(t)} onClick={() => toggle("target_audience", t)} />)}
            </div>
          </section>

          <section>
            <Label>Preferred event style</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {STYLES.map((t) => <Chip key={t} label={t} active={form.preferred_styles.includes(t)} onClick={() => toggle("preferred_styles", t)} />)}
            </div>
          </section>

          <section className="space-y-2">
            <Label>Preferred locations</Label>
            <LocationPicker country={locInput.country} city={locInput.city} onChange={setLocInput} />
            <Button variant="outline" size="sm" onClick={addLocation}>Add location</Button>
            <div className="flex flex-wrap gap-1 pt-2">
              {form.preferred_locations.map((l: string) => (
                <span key={l} className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-secondary text-xs">
                  {l}
                  <button onClick={() => setForm({ ...form, preferred_locations: form.preferred_locations.filter((x: string) => x !== l) })}>×</button>
                </span>
              ))}
            </div>
          </section>

          <Button className="w-full font-bold rounded-xl h-12" disabled={upsert.isPending || !form.name} onClick={submit}>
            {upsert.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save brand profile
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrandSetup;
