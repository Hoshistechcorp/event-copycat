import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Plus, Trash2, Sparkles, Star, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useVendors } from "@/hooks/useVendors";
import { useEventAssignments, useAddAssignment, useRemoveAssignment } from "@/hooks/useEventAssignments";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "@/hooks/use-toast";

// Same map as in the wizard
const TYPE_RECOMMENDATIONS: Record<string, string[]> = {
  "Concert / Live Show": ["venues", "djs", "lighting", "security", "videographers", "photographers"],
  Wedding: ["planners", "decorators", "caterers", "photographers", "videographers", "djs", "mcs", "florists", "traditional", "makeup"],
  "Private Party": ["venues", "djs", "bartenders", "decorators", "photographers"],
  "Corporate / Conference": ["venues", "caterers", "ushers", "mcs", "videographers", "lighting"],
  Birthday: ["decorators", "djs", "caterers", "photographers", "venues"],
  "Graduation / Brunch": ["caterers", "venues", "photographers", "decorators"],
  Music: ["venues", "djs", "lighting", "security", "videographers", "photographers"],
};

const EventTimeline = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { data: vendors = [] } = useVendors();
  const { data: assignments = [] } = useEventAssignments(id);
  const add = useAddAssignment();
  const remove = useRemoveAssignment();

  useEffect(() => {
    if (!id) return;
    supabase.from("events").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setEvent(data);
      setLoading(false);
    });
  }, [id]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) { navigate("/signin"); return null; }
  if (!event || event.host_id !== user.id) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-3xl px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">Event not found or you don't have access.</p>
          <Button onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
        </div>
      </div>
    );
  }

  const recommended = TYPE_RECOMMENDATIONS[event.category] ?? Object.values(TYPE_RECOMMENDATIONS)[0];
  const usedVendorIds = new Set(assignments.map((a) => a.vendor_id));
  const grouped = recommended.map((slug) => ({
    slug,
    vendors: vendors.filter((v) => v.vendor_categories?.slug === slug && !usedVendorIds.has(v.id)),
  }));

  const totalEstimate = assignments.reduce((acc, a) => acc + (a.vendors ? Number(a.vendors.base_price) : 0), 0);

  const handleAdd = async (vendorId: string, slug: string) => {
    try {
      await add.mutateAsync({
        event_id: id!,
        vendor_id: vendorId,
        category_slug: slug,
        scheduled_at: event.date,
        sort_order: assignments.length,
      });
      toast({ title: "Vendor added to timeline" });
    } catch (e: any) {
      toast({ title: "Could not add vendor", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-5xl px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Button>

        <div className="mb-6">
          <p className="text-xs font-bold text-primary mb-1">EVENT EXECUTION TIMELINE</p>
          <h1 className="text-3xl md:text-4xl font-extrabold">{event.title}</h1>
          <p className="text-sm text-muted-foreground">{event.category} · {event.venue} · {new Date(event.date).toLocaleString()}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl bg-secondary/50 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-bold text-sm">Recommended vendors for {event.category}</p>
                <p className="text-xs text-muted-foreground">Click + to add a vendor to this event's execution plan.</p>
              </div>
            </div>
            {grouped.map((g) => (
              <div key={g.slug}>
                <h3 className="font-bold capitalize mb-2">{g.slug}</h3>
                {g.vendors.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-3 rounded-xl border border-dashed">All available {g.slug} vendors are already in your timeline.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {g.vendors.slice(0, 4).map((v) => (
                      <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                        <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0">
                          {v.avatar_url && <img src={v.avatar_url} alt={v.business_name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{v.business_name}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Star className="h-3 w-3 fill-primary text-primary" /> {Number(v.rating).toFixed(1)} · {formatPrice(String(v.base_price))}
                          </p>
                        </div>
                        <Button size="sm" className="rounded-lg" onClick={() => handleAdd(v.id, g.slug)} disabled={add.isPending}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <aside className="md:sticky md:top-24 h-fit">
            <div className="rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold">Timeline ({assignments.length})</p>
                <p className="text-sm font-bold text-primary">{formatPrice(String(totalEstimate))}</p>
              </div>
              {assignments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No vendors yet. Add some from the recommendations.</p>
              ) : (
                <div className="space-y-2">
                  {assignments.map((a) => (
                    <div key={a.id} className="p-3 rounded-xl bg-secondary/40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{a.vendors?.business_name ?? "Vendor removed"}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{a.category_slug}</p>
                        </div>
                        <button onClick={() => remove.mutate(a.id)} className="text-destructive hover:opacity-70">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {a.scheduled_at ? new Date(a.scheduled_at).toLocaleString() : "TBD"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Button asChild variant="outline" className="w-full mt-4 rounded-xl">
                <Link to="/bloov-service">Browse all vendors</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventTimeline;
