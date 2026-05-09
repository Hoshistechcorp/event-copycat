import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, MapPin, ArrowLeft, Send } from "lucide-react";
import { useSponsorshipListing, useCreateOffer } from "@/hooks/useSponsorships";
import { useMyBrand } from "@/hooks/useBrands";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { routeGateway } from "@/lib/paymentRouter";

const SponsorshipListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { data: listing, isLoading } = useSponsorshipListing(id);
  const { data: brand } = useMyBrand();
  const createOffer = useCreateOffer();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Listing not found.</div>;

  const gw = routeGateway(listing.currency);

  const submit = async () => {
    if (!user) { navigate("/signin"); return; }
    if (!brand) { navigate("/brand/setup"); return; }
    try {
      await createOffer.mutateAsync({
        brand_id: brand.id,
        listing_id: listing.id,
        host_id: listing.host_id,
        amount: Number(amount),
        currency: listing.currency,
        message,
      });
      toast({ title: "Offer sent", description: `Routed via ${gw.label}.` });
      setOpen(false);
      setAmount(""); setMessage("");
    } catch (e: any) {
      toast({ title: "Could not send offer", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl px-4 py-10">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        {listing.hero_image_url && <img src={listing.hero_image_url} alt="" className="rounded-2xl w-full h-64 object-cover mb-6" />}
        <h1 className="text-3xl font-extrabold mb-2">{listing.title}</h1>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-6">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {listing.audience_size.toLocaleString()} guests</span>
          {listing.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {listing.city}{listing.country ? `, ${listing.country}` : ""}</span>}
          {listing.event_type && <Badge variant="secondary">{listing.event_type}</Badge>}
        </div>
        <p className="text-foreground/80 mb-6 whitespace-pre-line">{listing.description}</p>
        {listing.perks?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">Sponsor perks</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {listing.perks.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        )}
        <div className="rounded-2xl bg-card border border-border p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Asking</div>
            <div className="text-2xl font-extrabold text-primary">{formatPrice(String(listing.asking_amount))}</div>
            <div className="text-[11px] text-muted-foreground mt-1">Payments routed via {gw.label}</div>
          </div>
          <Button className="rounded-xl font-bold" onClick={() => setOpen(true)}>
            <Send className="h-4 w-4 mr-2" /> Send sponsor offer
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send a sponsorship offer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Offer amount ({listing.currency})</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`${listing.asking_amount}`} />
            </div>
            <div>
              <Label>Message to host</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Why your brand is a great fit..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={createOffer.isPending || !amount}>Send offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default SponsorshipListingDetail;
