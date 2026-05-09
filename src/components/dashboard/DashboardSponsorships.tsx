import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, Plus, Building2 } from "lucide-react";
import { useMyListings, useMyOffers, useUpdateOfferStatus } from "@/hooks/useSponsorships";
import { useMyBrand } from "@/hooks/useBrands";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateListing } from "@/hooks/useSponsorships";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import LocationPicker from "@/components/LocationPicker";

const DashboardSponsorships = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { data: listings = [] } = useMyListings();
  const { data: offers = [] } = useMyOffers();
  const { data: brand } = useMyBrand();
  const create = useCreateListing();
  const update = useUpdateOfferStatus();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ title: "", description: "", event_type: "", asking_amount: 1000, currency: "USD", audience_size: 100, perks: "", country: "", city: "" });

  const submit = async () => {
    try {
      await create.mutateAsync({ ...form, perks: form.perks.split(",").map((p: string) => p.trim()).filter(Boolean) });
      toast({ title: "Listing published" });
      setOpen(false);
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Brand profile shortcut */}
      <Card className="rounded-2xl border-border bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <div className="font-bold text-sm">{brand ? `Brand: ${brand.name}` : "You don't have a brand profile yet"}</div>
              <div className="text-xs text-muted-foreground">Set this up so hosts can find you for their events.</div>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl" onClick={() => navigate("/brand/setup")}>
            {brand ? "Edit brand" : "Create brand profile"}
          </Button>
        </CardContent>
      </Card>

      {/* My listings */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2"><Megaphone className="h-4 w-4" /> My sponsorship listings</h2>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> New listing</Button>
        </div>
        {listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No listings yet — publish one to attract sponsors.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {listings.map((l) => (
              <Card key={l.id} className="rounded-2xl"><CardContent className="p-4 space-y-1">
                <div className="font-bold">{l.title}</div>
                <div className="text-xs text-muted-foreground">{l.event_type} • {l.audience_size} guests {l.city && `• ${l.city}`}</div>
                <div className="text-sm font-bold text-primary">{formatPrice(String(l.asking_amount))}</div>
                <Badge variant="secondary" className="text-[10px]">{l.status}</Badge>
              </CardContent></Card>
            ))}
          </div>
        )}
      </section>

      {/* Offers */}
      <section>
        <h2 className="text-lg font-bold mb-3">Sponsor offers</h2>
        {offers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No offers yet.</p>
        ) : (
          <div className="space-y-2">
            {offers.map((o) => (
              <Card key={o.id} className="rounded-2xl"><CardContent className="p-4 flex flex-wrap justify-between gap-3 items-center">
                <div>
                  <div className="font-bold text-sm">{formatPrice(String(o.amount))} <span className="text-xs text-muted-foreground">({o.currency})</span></div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{o.message}</div>
                  <Badge variant={o.status === "accepted" ? "default" : "secondary"} className="text-[10px] mt-1">{o.status}</Badge>
                </div>
                {o.host_id === user?.id && o.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => update.mutate({ id: o.id, status: "accepted" })}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => update.mutate({ id: o.id, status: "declined" })}>Decline</Button>
                  </div>
                )}
                {o.brand_owner_id === user?.id && o.status === "pending" && (
                  <Button size="sm" variant="outline" onClick={() => update.mutate({ id: o.id, status: "withdrawn" })}>Withdraw</Button>
                )}
              </CardContent></Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New sponsorship listing</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Event type</Label><Input value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} /></div>
              <div><Label>Audience size</Label><Input type="number" value={form.audience_size} onChange={(e) => setForm({ ...form, audience_size: Number(e.target.value) })} /></div>
              <div><Label>Asking amount</Label><Input type="number" value={form.asking_amount} onChange={(e) => setForm({ ...form, asking_amount: Number(e.target.value) })} /></div>
              <div><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
            </div>
            <Label>Location</Label>
            <LocationPicker country={form.country} city={form.city} onChange={(l) => setForm({ ...form, ...l })} />
            <div><Label>Perks (comma separated)</Label><Input value={form.perks} onChange={(e) => setForm({ ...form, perks: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={create.isPending || !form.title}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardSponsorships;
