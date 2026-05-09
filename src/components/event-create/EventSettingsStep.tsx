import { useRef } from "react";
import Papa from "papaparse";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { currencies } from "@/contexts/CurrencyContext";
import { Globe2, Lock, Link2, Upload, Trash2, Mail } from "lucide-react";

export interface EventSettings {
  visibility: "public" | "private" | "unlisted";
  requires_rsvp: boolean;
  is_paid: boolean;
  currency: string;
}

export const defaultSettings: EventSettings = {
  visibility: "public",
  requires_rsvp: false,
  is_paid: false,
  currency: "USD",
};

export interface InviteRow { email: string; name: string }

const VISIBILITIES: { id: EventSettings["visibility"]; label: string; desc: string; icon: any }[] = [
  { id: "public", label: "Public", desc: "Listed in feeds, anyone can view & buy", icon: Globe2 },
  { id: "unlisted", label: "Unlisted", desc: "Only people with the link can view", icon: Link2 },
  { id: "private", label: "Private", desc: "Invite-only — guests RSVP via email", icon: Lock },
];

interface Props {
  settings: EventSettings;
  onChange: (s: EventSettings) => void;
  invites: InviteRow[];
  onInvitesChange: (i: InviteRow[]) => void;
}

const EventSettingsStep = ({ settings, onChange, invites, onInvitesChange }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof EventSettings>(k: K, v: EventSettings[K]) => onChange({ ...settings, [k]: v });

  const handleCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: InviteRow[] = results.data
          .map((r) => {
            const email = (r.email || r.Email || r.EMAIL || Object.values(r).find((v) => /@/.test(v || "")) || "").trim();
            const name = (r.name || r.Name || r.NAME || "").trim();
            return { email, name };
          })
          .filter((r) => /@/.test(r.email));
        onInvitesChange([...invites, ...rows]);
        if (fileRef.current) fileRef.current.value = "";
      },
    });
  };

  const addManual = () => onInvitesChange([...invites, { email: "", name: "" }]);
  const removeInvite = (i: number) => onInvitesChange(invites.filter((_, idx) => idx !== i));
  const updateInvite = (i: number, field: keyof InviteRow, value: string) => {
    const u = [...invites]; u[i] = { ...u[i], [field]: value }; onInvitesChange(u);
  };

  return (
    <div className="space-y-6">
      {/* Visibility */}
      <div>
        <label className="text-sm font-semibold mb-2 block">Who can see this event?</label>
        <div className="space-y-2">
          {VISIBILITIES.map((v) => {
            const Icon = v.icon;
            const active = settings.visibility === v.id;
            return (
              <button key={v.id} type="button" onClick={() => set("visibility", v.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}>
                <Icon className={`h-5 w-5 mt-0.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{v.label}</p>
                  <p className="text-xs text-muted-foreground">{v.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Paid + currency */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div>
            <p className="text-sm font-semibold">Paid event</p>
            <p className="text-xs text-muted-foreground">Charge for tickets</p>
          </div>
          <Switch checked={settings.is_paid} onCheckedChange={(c) => set("is_paid", c)} />
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <label className="text-xs font-semibold mb-1.5 block">Currency</label>
          <select value={settings.currency} onChange={(e) => set("currency", e.target.value)}
            className="w-full h-9 rounded-lg bg-secondary border border-border px-3 text-sm">
            {currencies.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>)}
          </select>
        </div>
      </div>

      {/* RSVP */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
        <div>
          <p className="text-sm font-semibold">Require RSVP</p>
          <p className="text-xs text-muted-foreground">Great for dinners, weddings, intimate events</p>
        </div>
        <Switch checked={settings.requires_rsvp} onCheckedChange={(c) => set("requires_rsvp", c)} />
      </div>

      {/* Invite list */}
      {(settings.visibility === "private" || settings.requires_rsvp) && (
        <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Invite list</h3>
              {invites.length > 0 && <span className="text-xs text-muted-foreground">({invites.length})</span>}
            </div>
            <div className="flex gap-2">
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsv} />
              <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3.5 w-3.5 mr-1" /> Upload CSV
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={addManual}>+ Add</Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">CSV format: <code className="bg-secondary px-1 rounded">email,name</code> — first row is the header.</p>

          {invites.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">No invites yet — upload a CSV or add manually.</div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {invites.map((inv, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input value={inv.email} onChange={(e) => updateInvite(i, "email", e.target.value)} placeholder="email@example.com" className="rounded-lg h-9 bg-secondary border-border text-xs flex-1" />
                  <Input value={inv.name} onChange={(e) => updateInvite(i, "name", e.target.value)} placeholder="Name" className="rounded-lg h-9 bg-secondary border-border text-xs w-32" />
                  <button type="button" onClick={() => removeInvite(i)} className="text-destructive shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventSettingsStep;
