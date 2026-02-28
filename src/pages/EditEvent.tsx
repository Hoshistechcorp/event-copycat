import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CalendarDays, MapPin, Clock, Plus, Trash2, Loader2, ImagePlus,
  DollarSign, Ticket, Type, Users, Music, ChevronLeft, ChevronRight, Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TicketTier {
  id?: string;
  name: string;
  price: string;
  quantity: string;
  description: string;
}

interface Performer {
  id?: string;
  name: string;
  role: string;
}

const CATEGORIES = [
  "Music", "Art", "Tech", "Sports", "Food & Drink", "Comedy", "Fashion", "Business", "Other",
];

const STEPS = [
  { label: "Basic Info", icon: Type },
  { label: "Date & Time", icon: CalendarDays },
  { label: "Location", icon: MapPin },
  { label: "Performers", icon: Music },
  { label: "Tickets", icon: Ticket },
];

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [venue, setVenue] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [category, setCategory] = useState("Music");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("draft");
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    const fetchEvent = async () => {
      const [{ data: event }, { data: tierData }, { data: perfData }] = await Promise.all([
        supabase.from("events").select("*").eq("id", id).eq("host_id", user.id).single(),
        supabase.from("ticket_tiers").select("*").eq("event_id", id).order("created_at"),
        supabase.from("performers").select("*").eq("event_id", id).order("created_at"),
      ]);

      if (!event) {
        toast({ title: "Event not found", variant: "destructive" });
        navigate("/dashboard");
        return;
      }

      setTitle(event.title);
      setDescription(event.description || "");
      const formatDT = (d: string) => d ? new Date(d).toISOString().slice(0, 16) : "";
      setDate(formatDT(event.date));
      setEndDate(event.end_date ? formatDT(event.end_date) : "");
      setVenue(event.venue);
      setVenueAddress(event.venue_address || "");
      setCategory(event.category || "Music");
      setCurrentImageUrl(event.image_url);
      setImagePreview(event.image_url);
      setStatus(event.status);
      setTiers(
        tierData && tierData.length > 0
          ? tierData.map((t: any) => ({ id: t.id, name: t.name, price: String(t.price), quantity: String(t.quantity), description: t.description || "" }))
          : [{ name: "General Admission", price: "0", quantity: "100", description: "" }]
      );
      setPerformers(
        perfData && perfData.length > 0
          ? perfData.map((p: any) => ({ id: p.id, name: p.name, role: p.role || "Performer" }))
          : []
      );
      setLoadingEvent(false);
    };
    fetchEvent();
  }, [user, id]);

  if (authLoading || loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) { navigate("/signin"); return null; }

  const validateStep = (s: number): string | null => {
    if (s === 0 && !title.trim()) return "Event title is required.";
    if (s === 1 && !date) return "Start date & time is required.";
    if (s === 2 && !venue.trim()) return "Venue name is required.";
    if (s === 4 && tiers.some((t) => !t.name.trim())) return "Every ticket tier needs a name.";
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => { setError(""); setStep((s) => Math.max(s - 1, 0)); };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const addPerformer = () => { if (performers.length >= 10) return; setPerformers([...performers, { name: "", role: "Performer" }]); };
  const removePerformer = (i: number) => setPerformers(performers.filter((_, idx) => idx !== i));
  const updatePerformer = (i: number, field: keyof Performer, value: string) => {
    const updated = [...performers]; updated[i] = { ...updated[i], [field]: value }; setPerformers(updated);
  };

  const addTier = () => { if (tiers.length >= 5) return; setTiers([...tiers, { name: "", price: "0", quantity: "50", description: "" }]); };
  const removeTier = (i: number) => { if (tiers.length <= 1) return; setTiers(tiers.filter((_, idx) => idx !== i)); };
  const updateTier = (i: number, field: keyof TicketTier, value: string) => {
    const updated = [...tiers]; updated[i] = { ...updated[i], [field]: value }; setTiers(updated);
  };

  const handleSubmit = async (newStatus: "draft" | "published") => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError("");
    setSubmitting(true);

    let imageUrl = currentImageUrl;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("event-images").upload(path, imageFile);
      if (uploadErr) { setError("Image upload failed: " + uploadErr.message); setSubmitting(false); return; }
      const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const { error: eventErr } = await supabase.from("events").update({
      title: title.trim(), description: description.trim() || null, date,
      end_date: endDate || null, venue: venue.trim(), venue_address: venueAddress.trim() || null,
      category, image_url: imageUrl, status: newStatus,
    }).eq("id", id!);

    if (eventErr) { setError(eventErr.message); setSubmitting(false); return; }

    // Replace tiers
    await supabase.from("ticket_tiers").delete().eq("event_id", id!);
    const tierInserts = tiers.map((t) => ({ event_id: id!, name: t.name.trim(), price: parseFloat(t.price) || 0, quantity: parseInt(t.quantity) || 100, description: t.description.trim() || null }));
    const { error: tierErr } = await supabase.from("ticket_tiers").insert(tierInserts);
    if (tierErr) { setError("Event updated but ticket tiers failed: " + tierErr.message); setSubmitting(false); return; }

    // Replace performers
    await supabase.from("performers").delete().eq("event_id", id!);
    const validPerformers = performers.filter((p) => p.name.trim());
    if (validPerformers.length > 0) {
      const perfInserts = validPerformers.map((p) => ({ event_id: id!, name: p.name.trim(), role: p.role.trim() || "Performer" }));
      await supabase.from("performers").insert(perfInserts);
    }

    toast({ title: "Event updated successfully" });
    navigate("/dashboard");
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Event Cover Image</label>
              <label htmlFor="event-image" className="flex items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-border bg-secondary/50 cursor-pointer hover:border-primary/50 transition-colors overflow-hidden">
                {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground"><ImagePlus className="h-8 w-8" /><span className="text-sm font-medium">Click to upload image</span></div>
                )}
              </label>
              <input id="event-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Event Title *</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your event a catchy title" className="rounded-xl pl-10 h-12 bg-secondary border-border" maxLength={200} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => setCategory(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what attendees can expect..." className="rounded-xl bg-secondary border-border min-h-[120px]" maxLength={2000} />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Start Date & Time *</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl pl-10 h-12 bg-secondary border-border" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">End Date & Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl pl-10 h-12 bg-secondary border-border" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground">💡 Tip: Setting an end date helps attendees plan their schedule. Doors typically open 30 minutes before the start time.</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Venue Name *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. The Grand Arena" className="rounded-xl pl-10 h-12 bg-secondary border-border" maxLength={200} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Full Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="123 Main St, City, Country" className="rounded-xl pl-10 h-12 bg-secondary border-border" maxLength={300} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground">📍 A full address helps attendees navigate to the venue. It will be displayed with a map on the event page.</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Performers</h3>
                <p className="text-xs text-muted-foreground">Add artists, speakers, or performers</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addPerformer} disabled={performers.length >= 10}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {performers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-1">No performers added yet</p>
                <p className="text-xs text-muted-foreground mb-4">This step is optional</p>
                <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addPerformer}>
                  <Plus className="h-4 w-4 mr-1" /> Add Performer
                </Button>
              </div>
            )}
            <div className="space-y-3">
              {performers.map((p, i) => (
                <div key={i} className="flex gap-3 items-start p-4 rounded-xl border border-border bg-card">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Name *</label>
                      <Input value={p.name} onChange={(e) => updatePerformer(i, "name", e.target.value)} placeholder="Performer name" className="rounded-xl h-10 bg-secondary border-border text-sm" maxLength={100} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Role</label>
                      <Input value={p.role} onChange={(e) => updatePerformer(i, "role", e.target.value)} placeholder="e.g. DJ, Singer" className="rounded-xl h-10 bg-secondary border-border text-sm" maxLength={100} />
                    </div>
                  </div>
                  <button type="button" onClick={() => removePerformer(i)} className="text-destructive hover:text-destructive/80 transition-colors mt-6">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Ticket Tiers</h3>
                <p className="text-xs text-muted-foreground">Define pricing and availability</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addTier} disabled={tiers.length >= 5}>
                <Plus className="h-4 w-4 mr-1" /> Add Tier
              </Button>
            </div>
            <div className="space-y-4">
              {tiers.map((tier, i) => (
                <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tier {i + 1}</span>
                    {tiers.length > 1 && (
                      <button type="button" onClick={() => removeTier(i)} className="text-destructive hover:text-destructive/80 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Name *</label>
                      <div className="relative">
                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={tier.name} onChange={(e) => updateTier(i, "name", e.target.value)} placeholder="e.g. VIP" className="rounded-xl pl-10 h-10 bg-secondary border-border text-sm" maxLength={100} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Price</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" min="0" step="0.01" value={tier.price} onChange={(e) => updateTier(i, "price", e.target.value)} className="rounded-xl pl-10 h-10 bg-secondary border-border text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Quantity</label>
                      <Input type="number" min="1" value={tier.quantity} onChange={(e) => updateTier(i, "quantity", e.target.value)} className="rounded-xl h-10 bg-secondary border-border text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Description</label>
                    <Input value={tier.description} onChange={(e) => updateTier(i, "description", e.target.value)} placeholder="What's included?" className="rounded-xl h-10 bg-secondary border-border text-sm" maxLength={300} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl px-4 py-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-foreground mb-1">Edit Event</h1>
          <p className="text-muted-foreground mb-8">Step {step + 1} of {STEPS.length}</p>

          {/* Stepper */}
          <div className="flex items-center gap-1 mb-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isCompleted = i < step;
              return (
                <div key={s.label} className="flex items-center flex-1">
                  <button type="button" onClick={() => { if (i <= step) { setError(""); setStep(i); } }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all w-full justify-center ${
                      isActive ? "bg-primary text-primary-foreground"
                        : isCompleted ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium mb-6">{error}</div>}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="min-h-[300px]">
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            {step > 0 && (
              <Button type="button" variant="outline" className="rounded-xl h-12 font-bold" onClick={goBack}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            <div className="flex-1" />
            {isLastStep ? (
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="rounded-xl h-12 font-bold" disabled={submitting} onClick={() => handleSubmit("draft")}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save as Draft"}
                </Button>
                <Button type="button" className="rounded-xl h-12 font-bold" disabled={submitting} onClick={() => handleSubmit("published")}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update & Publish"}
                </Button>
              </div>
            ) : (
              <Button type="button" className="rounded-xl h-12 font-bold" onClick={goNext}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default EditEvent;
