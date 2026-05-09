import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, MapPin, BadgeCheck, MessageSquare } from "lucide-react";
import { useVendor } from "@/hooks/useVendors";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "@/hooks/use-toast";

const VendorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vendor, isLoading } = useVendor(id);
  const { formatPrice } = useCurrency();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-5xl px-4 py-16 animate-pulse">
          <div className="h-72 rounded-3xl bg-muted mb-6" />
          <div className="h-8 w-1/3 bg-muted rounded mb-3" />
          <div className="h-4 w-1/2 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-5xl px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">Vendor not found.</p>
          <Button onClick={() => navigate("/bloov-service")}>Back to marketplace</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-5xl px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="relative aspect-[16/7] rounded-3xl overflow-hidden bg-secondary mb-6">
          {vendor.cover_url && (
            <img src={vendor.cover_url} alt={vendor.business_name} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              {vendor.is_verified && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
              )}
              <span className="text-xs text-muted-foreground capitalize">
                {vendor.vendor_categories?.name}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">{vendor.business_name}</h1>
            {vendor.tagline && <p className="text-muted-foreground mt-1">{vendor.tagline}</p>}

            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" /> {vendor.rating.toFixed(1)} ({vendor.review_count})
              </span>
              {vendor.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {vendor.city}, {vendor.country}
                </span>
              )}
            </div>

            {vendor.bio && (
              <div className="mt-6">
                <h2 className="font-bold mb-2">About</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{vendor.bio}</p>
              </div>
            )}

            <div className="mt-8 p-5 rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
              Portfolio gallery, availability calendar, and reviews are coming in Phase 9.
            </div>
          </div>

          <aside className="md:sticky md:top-24 h-fit">
            <div className="rounded-2xl border border-border p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Starting from</p>
              <p className="text-3xl font-extrabold text-foreground mt-1 mb-4">
                {formatPrice(String(vendor.base_price))}
              </p>
              <Button
                className="w-full rounded-xl font-bold gap-2"
                onClick={() => toast({ title: "Booking coming soon", description: "Direct vendor bookings ship in Phase 9." })}
              >
                <MessageSquare className="h-4 w-4" /> Request to book
              </Button>
              <p className="text-[11px] text-muted-foreground mt-3 text-center">
                You'll be able to chat, deposit, and pay in installments via Flex-it.
              </p>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VendorProfile;
