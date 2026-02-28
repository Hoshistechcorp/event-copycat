import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CalendarDays, MapPin, Clock, Plus, Trash2, Loader2, ImagePlus, DollarSign, Ticket, Type,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TicketTier {
  id?: string;
  name: string;
  price: string;
  quantity: string;
  description: string;
}

const CATEGORIES = [
  "Music", "Art", "Tech", "Sports", "Food & Drink", "Comedy", "Fashion", "Business", "Other",
];

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    const fetchEvent = async () => {
      const [{ data: event }, { data: tierData }] = await Promise.all([
        supabase.from("events").select("*").eq("id", id).eq("host_id", user.id).single(),
        supabase.from("ticket_tiers").select("*").eq("event_id", id).order("created_at"),
      ]);

      if (!event) {
        toast({ title: "Event not found", variant: "destructive" });
        navigate("/dashboard");
        return;
      }

      setTitle(event.title);
      setDescription(event.description || "");
      // Format datetime-local value
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
          ? tierData.map((t) => ({
              id: t.id,
              name: t.name,
              price: String(t.price),
              quantity: String(t.quantity),
              description: t.description || "",
            }))
          : [{ name: "General Admission", price: "0", quantity: "100", description: "" }]
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

  if (!user) {
    navigate("/signin");
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addTier = () => {
    if (tiers.length >= 5) return;
    setTiers([...tiers, { name: "", price: "0", quantity: "50", description: "" }]);
  };

  const removeTier = (index: number) => {
    if (tiers.length <= 1) return;
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof TicketTier, value: string) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    setTiers(updated);
  };

  const handleSubmit = async (newStatus: "draft" | "published") => {
    setError("");
    if (!title.trim() || !date || !venue.trim()) {
      setError("Please fill in all required fields (title, date, venue).");
      return;
    }
    if (tiers.some((t) => !t.name.trim())) {
      setError("Every ticket tier needs a name.");
      return;
    }

    setSubmitting(true);

    let imageUrl = currentImageUrl;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("event-images")
        .upload(path, imageFile);
      if (uploadErr) {
        setError("Image upload failed: " + uploadErr.message);
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const { error: eventErr } = await supabase
      .from("events")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        date,
        end_date: endDate || null,
        venue: venue.trim(),
        venue_address: venueAddress.trim() || null,
        category,
        image_url: imageUrl,
        status: newStatus,
      })
      .eq("id", id!);

    if (eventErr) {
      setError(eventErr.message);
      setSubmitting(false);
      return;
    }

    // Replace all tiers: delete existing then insert new
    await supabase.from("ticket_tiers").delete().eq("event_id", id!);

    const tierInserts = tiers.map((t) => ({
      event_id: id!,
      name: t.name.trim(),
      price: parseFloat(t.price) || 0,
      quantity: parseInt(t.quantity) || 100,
      description: t.description.trim() || null,
    }));

    const { error: tierErr } = await supabase.from("ticket_tiers").insert(tierInserts);
    if (tierErr) {
      setError("Event updated but ticket tiers failed: " + tierErr.message);
      setSubmitting(false);
      return;
    }

    toast({ title: "Event updated successfully" });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl px-4 py-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-foreground mb-1">Edit Event</h1>
          <p className="text-muted-foreground mb-8">Update your event details below.</p>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium mb-6">{error}</div>
          )}

          {/* Image upload */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-foreground mb-2 block">Event Cover Image</label>
            <label
              htmlFor="event-image"
              className="flex items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-border bg-secondary/50 cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-sm font-medium">Click to upload image</span>
                </div>
              )}
            </label>
            <input id="event-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* Event details */}
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Event Title *</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your event a catchy title" className="rounded-xl pl-10 h-12 bg-secondary border-border" required maxLength={200} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what attendees can expect..." className="rounded-xl bg-secondary border-border min-h-[120px]" maxLength={2000} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Start Date & Time *</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl pl-10 h-12 bg-secondary border-border" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">End Date & Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl pl-10 h-12 bg-secondary border-border" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Venue *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue name" className="rounded-xl pl-10 h-12 bg-secondary border-border" required maxLength={200} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="Full address" className="rounded-xl pl-10 h-12 bg-secondary border-border" maxLength={300} />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      category === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ticket Tiers */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Ticket Tiers</h2>
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
                      <button type="button" onClick={() => removeTier(i)} className="text-destructive hover:text-destructive/80 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                    <Input value={tier.description} onChange={(e) => updateTier(i, "description", e.target.value)} placeholder="What's included in this tier?" className="rounded-xl h-10 bg-secondary border-border text-sm" maxLength={300} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-12 flex-1 font-bold"
              disabled={submitting}
              onClick={() => handleSubmit("draft")}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save as Draft"}
            </Button>
            <Button
              type="button"
              className="rounded-xl h-12 flex-1 font-bold"
              disabled={submitting}
              onClick={() => handleSubmit("published")}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update & Publish"}
            </Button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default EditEvent;
