import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Trash2, ListChecks, Sparkles, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PlanRow {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: string;
  category: string;
  created_at: string;
}

const DashboardPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("id,title,date,venue,status,category,created_at")
      .eq("host_id", user.id)
      .in("status", ["draft", "planned"])
      .order("created_at", { ascending: false });
    if (!error && data) setPlans(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [user]);

  const remove = async (id: string) => {
    if (!confirm("Delete this plan? This also removes its timeline.")) return;
    await supabase.from("event_vendor_assignments").delete().eq("event_id", id);
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return toast({ title: "Could not delete", description: error.message, variant: "destructive" });
    toast({ title: "Plan deleted" });
    fetch();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (plans.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-10 text-center">
        <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
        <h3 className="font-bold mb-1">No plans yet</h3>
        <p className="text-sm text-muted-foreground mb-4">Use Event Planner to draft your next event end-to-end.</p>
        <Button onClick={() => navigate("/event-planner")} className="rounded-xl font-bold"><Plus className="h-4 w-4 mr-1" /> Start a plan</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">My Plans</h2>
        <Button size="sm" onClick={() => navigate("/event-planner")} className="rounded-xl font-bold"><Plus className="h-4 w-4 mr-1" /> New plan</Button>
      </div>
      {plans.map((p) => (
        <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-card border border-border p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold truncate">{p.title}</h3>
              <Badge variant={p.status === "draft" ? "secondary" : "default"} className="text-[10px]">{p.status}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {new Date(p.date).toLocaleDateString()} · {p.venue || "TBD"} · {p.category}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => navigate(`/event-planner?draft=${p.id}`)}><Pencil className="h-3.5 w-3.5 mr-1" /> Resume</Button>
            <Button size="sm" variant="outline" onClick={() => navigate(`/events/${p.id}/timeline`)}><ListChecks className="h-3.5 w-3.5 mr-1" /> Timeline</Button>
            <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardPlans;
