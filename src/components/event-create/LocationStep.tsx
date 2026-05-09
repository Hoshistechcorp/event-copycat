import { Input } from "@/components/ui/input";
import { MapPin, Globe, Eye, EyeOff, Clock } from "lucide-react";

export interface LocationFields {
  event_format: "in_person" | "online" | "hybrid";
  venue: string;
  venue_address: string;
  online_url: string;
  location_reveal: "always" | "on_rsvp" | "hours_before";
  reveal_hours_before: number;
}

export const defaultLocation: LocationFields = {
  event_format: "in_person",
  venue: "",
  venue_address: "",
  online_url: "",
  location_reveal: "always",
  reveal_hours_before: 24,
};

const FORMATS: { id: LocationFields["event_format"]; label: string; icon: any; desc: string }[] = [
  { id: "in_person", label: "In-person", icon: MapPin, desc: "Physical venue" },
  { id: "online", label: "Online", icon: Globe, desc: "Stream / call link" },
  { id: "hybrid", label: "Hybrid", icon: Eye, desc: "Both venue + stream" },
];

const REVEALS: { id: LocationFields["location_reveal"]; label: string; desc: string }[] = [
  { id: "always", label: "Always visible", desc: "Anyone viewing the event sees the location" },
  { id: "on_rsvp", label: "After RSVP / ticket", desc: "Reveal once a guest is confirmed" },
  { id: "hours_before", label: "Hours before start", desc: "Surprise drop closer to event time" },
];

const LocationStep = ({ value, onChange }: { value: LocationFields; onChange: (v: LocationFields) => void }) => {
  const set = <K extends keyof LocationFields>(k: K, v: LocationFields[K]) => onChange({ ...value, [k]: v });
  const showVenue = value.event_format === "in_person" || value.event_format === "hybrid";
  const showOnline = value.event_format === "online" || value.event_format === "hybrid";

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold mb-2 block">Event format</label>
        <div className="grid grid-cols-3 gap-2">
          {FORMATS.map((f) => {
            const Icon = f.icon;
            const active = value.event_format === f.id;
            return (
              <button key={f.id} type="button" onClick={() => set("event_format", f.id)}
                className={`p-3 rounded-xl border text-left transition-all ${active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/40"}`}>
                <Icon className={`h-5 w-5 mb-1.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-xs font-bold">{f.label}</p>
                <p className="text-[10px] text-muted-foreground">{f.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {showVenue && (
        <div className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border">
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Venue Name *</label>
            <Input value={value.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. The Grand Arena" className="rounded-xl h-11 bg-card border-border" maxLength={200} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Full Address</label>
            <Input value={value.venue_address} onChange={(e) => set("venue_address", e.target.value)} placeholder="123 Main St, City, Country" className="rounded-xl h-11 bg-card border-border" maxLength={300} />
          </div>
        </div>
      )}

      {showOnline && (
        <div className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border">
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Online URL *</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="url" value={value.online_url} onChange={(e) => set("online_url", e.target.value)} placeholder="https://zoom.us/j/... or YouTube live link" className="rounded-xl pl-10 h-11 bg-card border-border" maxLength={500} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Zoom, Google Meet, YouTube Live, Twitch — any URL works.</p>
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-semibold mb-2 block">Location reveal</label>
        <div className="space-y-2">
          {REVEALS.map((r) => {
            const active = value.location_reveal === r.id;
            return (
              <button key={r.id} type="button" onClick={() => set("location_reveal", r.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}>
                {r.id === "always" ? <Eye className={`h-4 w-4 mt-0.5 ${active ? "text-primary" : "text-muted-foreground"}`} /> :
                 r.id === "on_rsvp" ? <EyeOff className={`h-4 w-4 mt-0.5 ${active ? "text-primary" : "text-muted-foreground"}`} /> :
                 <Clock className={`h-4 w-4 mt-0.5 ${active ? "text-primary" : "text-muted-foreground"}`} />}
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        {value.location_reveal === "hours_before" && (
          <div className="mt-3 flex items-center gap-2">
            <label className="text-xs font-semibold">Reveal</label>
            <Input type="number" min="1" max="168" value={value.reveal_hours_before} onChange={(e) => set("reveal_hours_before", parseInt(e.target.value) || 24)} className="rounded-xl h-9 w-20 bg-secondary border-border text-sm" />
            <span className="text-xs text-muted-foreground">hours before start</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationStep;
