import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { currencies } from "@/contexts/CurrencyContext";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventSettingsStep, { type EventSettings, defaultSettings, type InviteRow } from "@/components/event-create/EventSettingsStep";
import LocationStep, { type LocationFields, defaultLocation } from "@/components/event-create/LocationStep";
import PromoInvitesStep, { type PromoCode } from "@/components/event-create/PromoInvitesStep";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CalendarDays, MapPin, Plus, Trash2, Loader2, ImagePlus, Save,
  Ticket, Type, Music, ChevronLeft, ChevronRight, Check, Users, Clock, FlaskConical, ShieldCheck,
} from "lucide-react";

interface TicketTier {
  name: string;
  price: string;
  quantity: string;
  description: string;
  test_fee_percent: string;
}
interface Performer {
  name: string;
  role: string;
  imageFile: File | null;
  imagePreview: string | null;
}

const CATEGORIES = ["Music", "Birthday", "Tech", "Sports", "Food & Drink", "Comedy", "Fashion", "Business", "Wedding", "Dinner", "Conference", "Other"];

const STEPS = [
  { label: "Basics", icon: Type },
  { label: "When & Where", icon: MapPin },
  { label: "Audience", icon: Users },
  { label: "Lineup", icon: Music },
  { label: "Tickets & Promo", icon: Ticket },
];

const CreateEvent = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  // Step 0
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Music");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Step 1
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState<LocationFields>(defaultLocation);

  // Step 2
  const [settings, setSettings] = useState<EventSettings>(defaultSettings);
  const [invites, setInvites] = useState<InviteRow[]>([]);

  // Step 3
  const [performers, setPerformers] = useState<Performer[]>([]);

  // Step 4
  const [tiers, setTiers] = useState<TicketTier[]>([
    { name: "General Admission", price: "0", quantity: "100", description: "", test_fee_percent: "0" },
  ]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [openToSponsorship, setOpenToSponsorship] = useState(false);
  const [donateUrl, setDonateUrl] = useState("");
  const [donateQrFile, setDonateQrFile] = useState<File | null>(null);
  const [donateQrPreview, setDonateQrPreview] = useState<string | null>(null);
  const [refundPolicy, setRefundPolicy] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<"draft" | "published" | "test" | null>(null);
  const [error, setError] = useState("");
  const [restoreOpen, setRestoreOpen] = useState(false);
  const draftLoadedRef = useRef(false);

  const draftKey = user ? `ibloov_draft_event_${user.id}` : null;

  // Restore prompt on mount
  useEffect(() => {
    if (!draftKey || draftLoadedRef.current) return;
    const raw = localStorage.getItem(draftKey);
    if (raw) setRestoreOpen(true);
    draftLoadedRef.current = true;
  }, [draftKey]);

  // Auto-save (debounced) — text/JSON state only, not File blobs
  useEffect(() => {
    if (!draftKey) return;
    const t = setTimeout(() => {
      const snap = {
        step, title, description, category, imagePreview,
        date, endDate, location, settings, invites, performers: performers.map((p) => ({ name: p.name, role: p.role, imagePreview: p.imagePreview })),
        tiers, promoCodes, openToSponsorship, donateUrl, donateQrPreview, refundPolicy, videoUrl, savedAt: new Date().toISOString(),
      };
      try { localStorage.setItem(draftKey, JSON.stringify(snap)); } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [draftKey, step, title, description, category, imagePreview, date, endDate, location, settings, invites, performers, tiers, promoCodes, openToSponsorship, donateUrl, donateQrPreview, refundPolicy, videoUrl]);

  const restoreDraft = () => {
    if (!draftKey) return;
    try {
      const snap = JSON.parse(localStorage.getItem(draftKey) || "{}");
      if (snap.title !== undefined) setTitle(snap.title);
      if (snap.description !== undefined) setDescription(snap.description);
      if (snap.category) setCategory(snap.category);
      if (snap.imagePreview) setImagePreview(snap.imagePreview);
      if (snap.date) setDate(snap.date);
      if (snap.endDate) setEndDate(snap.endDate);
      if (snap.location) setLocation(snap.location);
      if (snap.settings) setSettings(snap.settings);
      if (snap.invites) setInvites(snap.invites);
      if (snap.performers) setPerformers(snap.performers.map((p: any) => ({ ...p, imageFile: null })));
      if (snap.tiers) setTiers(snap.tiers);
      if (snap.promoCodes) setPromoCodes(snap.promoCodes);
      if (typeof snap.openToSponsorship === "boolean") setOpenToSponsorship(snap.openToSponsorship);
      if (typeof snap.donateUrl === "string") setDonateUrl(snap.donateUrl);
      if (snap.donateQrPreview) setDonateQrPreview(snap.donateQrPreview);
      if (typeof snap.refundPolicy === "string") setRefundPolicy(snap.refundPolicy);
      if (typeof snap.videoUrl === "string") setVideoUrl(snap.videoUrl);
      if (typeof snap.step === "number") setStep(snap.step);
      toast({ title: "Draft restored", description: "Picked up where you left off." });
    } catch {}
    setRestoreOpen(false);
  };

  const discardDraft = () => {
    if (draftKey) localStorage.removeItem(draftKey);
    setRestoreOpen(false);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) { navigate("/signin"); return null; }

  const validateStep = (s: number): string | null => {
    if (s === 0 && !title.trim()) return "Event title is required.";
    if (s === 1) {
      if (!date) return "Start date & time is required.";
      if (location.event_format === "in_person" && !location.venue.trim()) return "Venue name is required for in-person events.";
      if (location.event_format === "online" && !location.online_url.trim()) return "Online URL is required for online events.";
      if (location.event_format === "hybrid" && (!location.venue.trim() || !location.online_url.trim())) return "Hybrid events need both venue and online URL.";
    }
    if (s === 4 && tiers.some((t) => !t.name.trim())) return "Every ticket tier needs a name.";
    if (s === 4 && settings.is_paid && tiers.every((t) => parseFloat(t.price) === 0)) return "Add at least one paid tier or switch to a free event.";
    if (s === 4 && donateUrl.trim()) {
      try {
        const u = new URL(donateUrl.trim());
        if (!/^https?:$/.test(u.protocol)) return "FlexIt donation link must start with http:// or https://";
      } catch { return "FlexIt donation link is not a valid URL."; }
    }
    if (s === 0 && videoUrl.trim()) {
      try {
        const u = new URL(videoUrl.trim());
        if (!/^https?:$/.test(u.protocol)) return "Video link must start with http:// or https://";
      } catch { return "Video link is not a valid URL."; }
    }
    return null;
  };

  const goNext = () => { const e = validateStep(step); if (e) { setError(e); return; } setError(""); setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const goBack = () => { setError(""); setStep((s) => Math.max(s - 1, 0)); };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const addPerformer = () => { if (performers.length >= 10) return; setPerformers([...performers, { name: "", role: "Performer", imageFile: null, imagePreview: null }]); };
  const removePerformer = (i: number) => setPerformers(performers.filter((_, idx) => idx !== i));
  const updatePerformer = (i: number, field: keyof Performer, value: string) => { const u = [...performers]; u[i] = { ...u[i], [field]: value }; setPerformers(u); };
  const handlePerformerImage = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) { const u = [...performers]; u[i] = { ...u[i], imageFile: file, imagePreview: URL.createObjectURL(file) }; setPerformers(u); }
  };

  const addTier = () => { if (tiers.length >= 5) return; setTiers([...tiers, { name: "", price: settings.is_paid ? "10" : "0", quantity: "50", description: "", test_fee_percent: "0" }]); };
  const removeTier = (i: number) => { if (tiers.length <= 1) return; setTiers(tiers.filter((_, idx) => idx !== i)); };
  const updateTier = (i: number, field: keyof TicketTier, value: string) => { const u = [...tiers]; u[i] = { ...u[i], [field]: value }; setTiers(u); };

  const handleSaveLater = () => {
    // Local-only save (autosave already covers it; this is the explicit confirmation).
    if (!draftKey) return;
    const snap = {
      step, title, description, category, imagePreview,
      date, endDate, location, settings, invites,
      performers: performers.map((p) => ({ name: p.name, role: p.role, imagePreview: p.imagePreview })),
      tiers, promoCodes, openToSponsorship, donateUrl, donateQrPreview, refundPolicy, savedAt: new Date().toISOString(),
    };
    try { localStorage.setItem(draftKey, JSON.stringify(snap)); } catch {}
    toast({ title: "Saved", description: "Your draft is safe — come back anytime to finish." });
    navigate("/dashboard?tab=events");
  };

  const handleSubmit = async (mode: "draft" | "published" | "test") => {
    // Drafts: skip strict validation, but require a title at minimum
    if (mode !== "draft") {
      const e = validateStep(step); if (e) { setError(e); return; }
    } else if (!title.trim()) {
      setError("Add a title before saving as draft.");
      return;
    }
    setError(""); setSubmitting(true); setSubmitMode(mode);

    let imageUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("event-images").upload(path, imageFile);
      if (upErr) { setError("Image upload failed: " + upErr.message); setSubmitting(false); setSubmitMode(null); return; }
      imageUrl = supabase.storage.from("event-images").getPublicUrl(path).data.publicUrl;
    }

    let donateQrUrl: string | null = null;
    if (donateQrFile) {
      const ext = donateQrFile.name.split(".").pop();
      const path = `${user.id}/donate-qr-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("event-images").upload(path, donateQrFile);
      if (!upErr) donateQrUrl = supabase.storage.from("event-images").getPublicUrl(path).data.publicUrl;
    }

    const isTest = mode === "test";
    const status = mode === "draft" ? "draft" : "published";
    // Test runs publish unlisted (only people with the link see it) so creators can validate demand.
    const visibility = isTest ? "unlisted" : settings.visibility;
    const finalDate = date || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

    // If any tier has a test fee %, the test run becomes paid (creator collects fraction of normal price)
    const testHasPaidTiers = isTest && tiers.some((t) => (parseFloat(t.test_fee_percent) || 0) > 0 && (parseFloat(t.price) || 0) > 0);

    const { data: eventData, error: evErr } = await supabase.from("events").insert({
      host_id: user.id,
      title: isTest ? `[Test Run] ${title.trim()}` : title.trim(),
      description: description.trim() || null,
      date: finalDate,
      end_date: endDate || null,
      venue: location.venue.trim() || (location.event_format === "online" ? "Online" : ""),
      venue_address: location.venue_address.trim() || null,
      category,
      image_url: imageUrl,
      status,
      event_format: location.event_format,
      online_url: location.online_url.trim() || null,
      location_reveal: location.location_reveal,
      reveal_hours_before: location.reveal_hours_before,
      visibility,
      requires_rsvp: isTest && !testHasPaidTiers ? true : settings.requires_rsvp,
      is_paid: isTest ? testHasPaidTiers : settings.is_paid,
      currency: settings.currency,
      open_to_sponsorship: openToSponsorship,
      donate_flexit_url: donateUrl.trim() || null,
      donate_flexit_qr_url: donateQrUrl,
      refund_policy: refundPolicy.trim() || null,
      video_url: videoUrl.trim() || null,
    } as any).select("id").single();

    if (evErr || !eventData) { setError(evErr?.message || "Failed to create event."); setSubmitting(false); setSubmitMode(null); return; }
    const eventId = eventData.id;

    // Tickets
    let tierInserts: any[];
    if (isTest && !testHasPaidTiers) {
      tierInserts = [{ event_id: eventId, name: "Interested", price: 0, quantity: 1000, description: "Tap RSVP if you'd come to this event.", test_fee_percent: 0 }];
    } else if (isTest) {
      // Test run with partial fee per tier
      tierInserts = tiers.map((t) => {
        const pct = Math.min(100, Math.max(0, parseFloat(t.test_fee_percent) || 0));
        const fullPrice = parseFloat(t.price) || 0;
        const testPrice = +(fullPrice * (pct / 100)).toFixed(2);
        return {
          event_id: eventId,
          name: `${t.name.trim()} (Test ${pct}%)`,
          price: testPrice,
          quantity: parseInt(t.quantity) || 100,
          description: t.description.trim() || `Test-run pricing — ${pct}% of full price`,
          test_fee_percent: pct,
        };
      });
    } else {
      tierInserts = tiers.map((t) => ({
        event_id: eventId,
        name: t.name.trim(),
        price: settings.is_paid ? (parseFloat(t.price) || 0) : 0,
        quantity: parseInt(t.quantity) || 100,
        description: t.description.trim() || null,
        test_fee_percent: 0,
      }));
    }
    await supabase.from("ticket_tiers").insert(tierInserts);

    // Performers
    const validPerformers = performers.filter((p) => p.name.trim());
    if (validPerformers.length > 0) {
      const perfInserts = await Promise.all(validPerformers.map(async (p) => {
        let avatarUrl: string | null = null;
        if (p.imageFile) {
          const ext = p.imageFile.name.split(".").pop();
          const path = `performers/${eventId}/${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabase.storage.from("avatars").upload(path, p.imageFile);
          if (!upErr) avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
        }
        return { event_id: eventId, name: p.name.trim(), role: p.role.trim() || "Performer", avatar_url: avatarUrl };
      }));
      await supabase.from("performers").insert(perfInserts);
    }

    // Promo codes (skip on test)
    if (!isTest) {
      const validPromos = promoCodes.filter((p) => p.code.trim());
      if (validPromos.length > 0) {
        await supabase.from("promo_codes").insert(validPromos.map((p) => ({
          event_id: eventId,
          code: p.code.trim().toUpperCase(),
          discount_type: p.discount_type,
          value: parseFloat(p.value) || 0,
          max_uses: p.max_uses ? parseInt(p.max_uses) : null,
          active: true,
        })));
      }

      // CSV invites
      const validInvites = invites.filter((i) => i.email.trim());
      if (validInvites.length > 0) {
        await supabase.from("event_invites").insert(validInvites.map((i) => ({
          event_id: eventId,
          email: i.email.trim().toLowerCase(),
          name: i.name.trim() || null,
        })));
      }
    }

    if (draftKey) localStorage.removeItem(draftKey);

    if (mode === "draft") {
      toast({ title: "Draft saved", description: "Find it under My Events to finish later." });
      navigate("/dashboard?tab=events");
    } else if (isTest) {
      toast({ title: "Test run live!", description: "Share the link to see who would attend." });
      navigate("/events/" + eventId);
    } else {
      navigate("/events/" + eventId);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold mb-2 block">Event Cover Image</label>
              <label htmlFor="event-image" className="flex items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-border bg-secondary/50 cursor-pointer hover:border-primary/50 transition-colors overflow-hidden">
                {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground"><ImagePlus className="h-8 w-8" /><span className="text-sm font-medium">Click to upload image</span></div>
                )}
              </label>
              <input id="event-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Event Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your event a catchy title" className="rounded-xl h-12 bg-secondary border-border" maxLength={200} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => setCategory(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what attendees can expect..." className="rounded-xl bg-secondary border-border min-h-[120px]" maxLength={2000} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Video link <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste a TikTok, YouTube, Instagram or Facebook video URL"
                className="rounded-xl h-11 bg-secondary border-border text-sm"
                maxLength={500}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Adds a watch link/embed on your event page to hype attendees.</p>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Start Date & Time *</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl pl-10 h-12 bg-secondary border-border" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">End Date & Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl pl-10 h-12 bg-secondary border-border" />
                </div>
              </div>
            </div>
            <LocationStep value={location} onChange={setLocation} />
          </div>
        );
      case 2:
        return (
          <EventSettingsStep
            settings={settings}
            onChange={setSettings}
            invites={invites}
            onInvitesChange={setInvites}
          />
        );
      case 3:
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Performers</h3>
                <p className="text-xs text-muted-foreground">Optional — add artists, speakers, or hosts</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addPerformer} disabled={performers.length >= 10}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {performers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-1">No performers added</p>
                <p className="text-xs text-muted-foreground mb-4">Skip this step or add some now</p>
                <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addPerformer}><Plus className="h-4 w-4 mr-1" /> Add</Button>
              </div>
            )}
            <div className="space-y-3">
              {performers.map((p, i) => (
                <div key={i} className="flex gap-3 items-start p-4 rounded-xl border border-border bg-card">
                  <label htmlFor={`pimg-${i}`} className="shrink-0 cursor-pointer">
                    {p.imagePreview ? <img src={p.imagePreview} alt={p.name} className="w-14 h-14 rounded-full object-cover border-2 border-border" /> : (
                      <div className="w-14 h-14 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center"><ImagePlus className="h-5 w-5 text-muted-foreground" /></div>
                    )}
                    <input id={`pimg-${i}`} type="file" accept="image/*" className="hidden" onChange={(e) => handlePerformerImage(i, e)} />
                  </label>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input value={p.name} onChange={(e) => updatePerformer(i, "name", e.target.value)} placeholder="Name" className="rounded-xl h-10 bg-secondary border-border text-sm" maxLength={100} />
                    <Input value={p.role} onChange={(e) => updatePerformer(i, "role", e.target.value)} placeholder="Role (DJ, Speaker...)" className="rounded-xl h-10 bg-secondary border-border text-sm" maxLength={100} />
                  </div>
                  <button type="button" onClick={() => removePerformer(i)} className="text-destructive hover:text-destructive/80 mt-3"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        );
      case 4: {
        const symbol = currencies.find((c) => c.code === settings.currency)?.symbol || "$";
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Ticket Tiers</h3>
                  <p className="text-xs text-muted-foreground">{settings.is_paid ? `Prices in ${settings.currency}` : "Free event — quantity caps only"}</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addTier} disabled={tiers.length >= 5}><Plus className="h-4 w-4 mr-1" /> Add Tier</Button>
              </div>
              <div className="space-y-3">
                {tiers.map((tier, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-border bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tier {i + 1}</span>
                      {tiers.length > 1 && <button type="button" onClick={() => removeTier(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input value={tier.name} onChange={(e) => updateTier(i, "name", e.target.value)} placeholder="e.g. VIP" className="rounded-xl h-10 bg-secondary border-border text-sm" maxLength={100} />
                      {settings.is_paid && (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">{symbol}</span>
                          <Input type="number" min="0" step="0.01" value={tier.price} onChange={(e) => updateTier(i, "price", e.target.value)} className="rounded-xl pl-8 h-10 bg-secondary border-border text-sm" />
                        </div>
                      )}
                      <Input type="number" min="1" value={tier.quantity} onChange={(e) => updateTier(i, "quantity", e.target.value)} placeholder="Qty" className="rounded-xl h-10 bg-secondary border-border text-sm" />
                    </div>
                    <Input value={tier.description} onChange={(e) => updateTier(i, "description", e.target.value)} placeholder="What's included? (comma separated)" className="rounded-xl h-10 bg-secondary border-border text-sm" maxLength={300} />
                    {settings.is_paid && parseFloat(tier.price) > 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <FlaskConical className="h-4 w-4 text-amber-600 shrink-0" />
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-amber-700 block">Test-run fee %</label>
                          <p className="text-[10px] text-muted-foreground">Charged when you launch a Test Run. 0 = free RSVP.</p>
                        </div>
                        <div className="relative w-24">
                          <Input type="number" min="0" max="100" step="1" value={tier.test_fee_percent} onChange={(e) => updateTier(i, "test_fee_percent", e.target.value)} className="rounded-xl pr-7 h-9 bg-background border-border text-sm" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">Refund policy</h3>
                  <p className="text-xs text-muted-foreground">Set your own refund terms for Test Runs and ticket purchases. This appears in checkout.</p>
                </div>
              </div>
              <Textarea
                value={refundPolicy}
                onChange={(e) => setRefundPolicy(e.target.value)}
                placeholder="e.g. Full refund if cancelled 48h before the event. No refunds within 24h of start time."
                className="rounded-xl bg-secondary border-border text-sm min-h-[80px]"
                maxLength={1000}
              />
              <p className="text-[10px] text-muted-foreground text-right">{refundPolicy.length}/1000</p>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card flex items-start gap-3">
              <input
                id="sponsorship-toggle"
                type="checkbox"
                checked={openToSponsorship}
                onChange={(e) => setOpenToSponsorship(e.target.checked)}
                className="mt-1 h-4 w-4 rounded accent-primary"
              />
              <label htmlFor="sponsorship-toggle" className="flex-1 cursor-pointer">
                <span className="text-sm font-semibold block">Open to sponsorship & brand deals</span>
                <span className="text-xs text-muted-foreground">List this event to brands looking to sponsor — works for Test Runs and live events.</span>
              </label>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-extrabold text-sm">$</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">Donations via iBloov FlexIt</h3>
                  <p className="text-xs text-muted-foreground">Let attendees chip in. Paste your FlexIt link or upload a QR — both show on the event page.</p>
                </div>
                <a href="/flexit" target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-primary underline shrink-0 mt-1">Create one</a>
              </div>
              <Input
                value={donateUrl}
                onChange={(e) => setDonateUrl(e.target.value)}
                placeholder="https://ibloov.com/flexit/your-link"
                className="rounded-xl h-10 bg-secondary border-border text-sm"
              />
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <label htmlFor="donate-qr" className="cursor-pointer block">
                    {donateQrPreview ? (
                      <img src={donateQrPreview} alt="QR code preview" className="w-16 h-16 rounded-xl object-cover border border-border" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border bg-secondary flex items-center justify-center">
                        <ImagePlus className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </label>
                  <input id="donate-qr" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) { return; }
                    const reset = () => {
                      setDonateQrFile(null);
                      if (donateQrPreview?.startsWith("blob:")) URL.revokeObjectURL(donateQrPreview);
                      setDonateQrPreview(null);
                      e.target.value = "";
                    };
                    if (!f.type.startsWith("image/")) {
                      toast({ title: "Image files only", description: "Upload a PNG, JPG, WEBP, or SVG of your QR code.", variant: "destructive" });
                      reset();
                      return;
                    }
                    if (f.size > 5 * 1024 * 1024) {
                      toast({ title: "File too large", description: "QR image must be under 5MB.", variant: "destructive" });
                      reset();
                      return;
                    }
                    if (donateQrPreview?.startsWith("blob:")) URL.revokeObjectURL(donateQrPreview);
                    setDonateQrFile(f);
                    setDonateQrPreview(URL.createObjectURL(f));
                  }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Optional QR image (PNG/JPG/WEBP/SVG, max 5MB) — guests can scan straight from the event page.</p>
                  {donateQrPreview && (
                    <div className="flex gap-2 mt-2">
                      <Button type="button" size="sm" variant="outline" className="rounded-lg h-7 text-xs" onClick={() => document.getElementById("donate-qr")?.click()}>
                        Replace
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="rounded-lg h-7 text-xs text-destructive hover:text-destructive" onClick={() => {
                        if (donateQrPreview?.startsWith("blob:")) URL.revokeObjectURL(donateQrPreview);
                        setDonateQrFile(null);
                        setDonateQrPreview(null);
                        const input = document.getElementById("donate-qr") as HTMLInputElement | null;
                        if (input) input.value = "";
                      }}>
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <PromoInvitesStep
              promoCodes={promoCodes}
              onPromoChange={setPromoCodes}
              currencySymbol={symbol}
            />
          </div>
        );
      }
      default: return null;
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl px-4 py-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-8 gap-3">
            <div>
              <h1 className="text-3xl font-extrabold mb-1">Create Event</h1>
              <p className="text-muted-foreground text-sm">Step {step + 1} of {STEPS.length} · Auto-saving as you type</p>
            </div>
            <Button
              type="button" variant="outline" size="sm"
              className="rounded-xl shrink-0 hidden sm:inline-flex"
              onClick={handleSaveLater}
              disabled={submitting}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" /> Save & continue later
            </Button>
          </div>

          <div className="flex items-center gap-1 mb-8 overflow-x-auto">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isCompleted = i < step;
              return (
                <button key={s.label} type="button" onClick={() => { if (i < step) { setError(""); setStep(i); } }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-1 justify-center min-w-[90px] ${
                    isActive ? "bg-primary text-primary-foreground" : isCompleted ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                  }`}>
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>

          {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium mb-6">{error}</div>}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="min-h-[300px]">
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-2 mt-10">
            {step > 0 && (
              <Button type="button" variant="outline" className="rounded-xl h-12 font-bold" onClick={goBack}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            <Button
              type="button" variant="ghost"
              className="rounded-xl h-12 font-bold sm:hidden justify-start"
              onClick={handleSaveLater} disabled={submitting}
            >
              <Save className="h-4 w-4 mr-1.5" /> Save & continue later
            </Button>
            <div className="flex-1" />
            {isLastStep ? (
              <div className="grid grid-cols-1 sm:flex sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button type="button" variant="outline" className="rounded-xl h-12 font-bold" disabled={submitting} onClick={() => handleSubmit("draft")}>
                  {submitting && submitMode === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save as Draft"}
                </Button>
                <Button type="button" variant="outline" className="rounded-xl h-12 font-bold border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700" disabled={submitting} onClick={() => handleSubmit("test")} title="Publish unlisted, free RSVP — share the link to gauge interest">
                  {submitting && submitMode === "test" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><FlaskConical className="h-4 w-4 mr-1.5" /> Test Run</>}
                </Button>
                <Button type="button" className="rounded-xl h-12 font-bold" disabled={submitting} onClick={() => handleSubmit("published")}>
                  {submitting && submitMode === "published" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Event"}
                </Button>
              </div>
            ) : (
              <Button type="button" className="rounded-xl h-12 font-bold" onClick={goNext}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
            )}
          </div>

          {isLastStep && (
            <p className="text-[11px] text-muted-foreground text-center mt-4">
              <span className="font-semibold text-amber-600">Test Run</span> publishes an unlisted event so only people with your link see it. Set a Test-run fee % per tier to collect a portion of the ticket price, or leave it at 0 for a free RSVP-only validation.
            </p>
          )}
        </motion.div>
      </div>

      <AlertDialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Resume your draft?</AlertDialogTitle>
            <AlertDialogDescription>
              We found an event you started earlier on this device. Pick up where you left off, or start fresh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" onClick={discardDraft}>Start fresh</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl" onClick={restoreDraft}>Resume draft</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default CreateEvent;
