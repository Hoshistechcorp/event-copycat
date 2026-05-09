import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  eventId: string;
  eventTitle: string;
  inviteId?: string;
  onRsvped?: () => void;
}

const RsvpDialog = ({ open, onOpenChange, eventId, eventTitle, inviteId, onRsvped }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [plusOnes, setPlusOnes] = useState(0);
  const [status, setStatus] = useState<"going" | "maybe" | "not_going">("going");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!user && !inviteId) {
      toast({ title: "Please sign in to RSVP", variant: "destructive" });
      navigate("/signin");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("rsvps").insert({
      event_id: eventId,
      user_id: user?.id || null,
      email: email.trim() || user?.email || null,
      name: name.trim() || null,
      status,
      plus_ones: plusOnes,
      invite_id: inviteId || null,
    });
    setSubmitting(false);
    if (error) { toast({ title: "RSVP failed", description: error.message, variant: "destructive" }); return; }
    setDone(true);
    onRsvped?.();
    setTimeout(() => onOpenChange(false), 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader><DialogTitle>RSVP to {eventTitle}</DialogTitle></DialogHeader>
        {done ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><Check className="w-7 h-7 text-primary" /></div>
            <p className="text-sm font-semibold">You're confirmed!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(["going","maybe","not_going"] as const).map((s) => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`p-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${status === s ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}>
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
            <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
            <div>
              <label className="text-xs font-semibold mb-1.5 block">Bringing guests?</label>
              <Input type="number" min="0" max="10" value={plusOnes} onChange={(e) => setPlusOnes(parseInt(e.target.value) || 0)} className="rounded-xl" />
            </div>
            <Button className="w-full rounded-xl h-11 font-bold" onClick={submit} disabled={submitting || !email.trim()}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm RSVP"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RsvpDialog;
