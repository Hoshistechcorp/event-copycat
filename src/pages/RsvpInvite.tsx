import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RsvpDialog from "@/components/RsvpDialog";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Globe, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InviteData {
  id: string;
  event_id: string;
  email: string;
  name: string | null;
  status: string;
  event_title: string;
  event_date: string;
  event_venue: string;
  event_format: string;
}

const RsvpInvite = () => {
  const { token } = useParams();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data } = await supabase.rpc("get_invite_by_token", { _token: token });
      setInvite((data as any)?.[0] || null);
      setLoading(false);
    })();
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (!invite) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Invite not found</h1>
          <p className="text-sm text-muted-foreground">This link may have expired.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const dt = new Date(invite.event_date);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container px-4 py-12 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">You're invited</div>
          <h1 className="text-2xl font-extrabold mb-1">{invite.event_title}</h1>
          <p className="text-sm text-muted-foreground mb-6">Hi {invite.name || invite.email.split("@")[0]} — please let the host know if you'll attend.</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <Calendar className="w-4 h-4 text-primary" />
              <div className="text-sm">{dt.toLocaleString(undefined, { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              {invite.event_format === "online" ? <Globe className="w-4 h-4 text-primary" /> : <MapPin className="w-4 h-4 text-primary" />}
              <div className="text-sm">{invite.event_venue}</div>
            </div>
          </div>

          {done || invite.status !== "pending" ? (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
              <Check className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold text-primary">RSVP recorded — see you there!</p>
            </div>
          ) : (
            <Button className="w-full rounded-xl h-12 font-bold" onClick={() => setOpen(true)}>RSVP Now</Button>
          )}
        </div>
      </section>

      <RsvpDialog
        open={open}
        onOpenChange={setOpen}
        eventId={invite.event_id}
        eventTitle={invite.event_title}
        inviteId={invite.id}
        onRsvped={() => setDone(true)}
      />
      <Footer />
    </div>
  );
};

export default RsvpInvite;
