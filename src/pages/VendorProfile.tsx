import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Star, MapPin, BadgeCheck, MessageSquare, Mail, Phone, Globe,
  Instagram, Twitter,
} from "lucide-react";
import { useVendor } from "@/hooks/useVendors";
import { usePackages } from "@/hooks/usePackages";
import { useCurrency } from "@/contexts/CurrencyContext";
import BookingDialog from "@/components/bloov/BookingDialog";
import PackageCard from "@/components/bloov/PackageCard";

const VendorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vendor, isLoading } = useVendor(id);
  const { data: packages = [] } = usePackages();
  const { formatPrice } = useCurrency();
  const [bookingOpen, setBookingOpen] = useState(false);

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

  const categorySlug = vendor.vendor_categories?.slug;
  const relatedPackages = packages.filter((p) =>
    categorySlug ? p.included_vendor_categories?.includes(categorySlug) : false
  );

  const gallery = vendor.portfolio_urls?.length
    ? vendor.portfolio_urls
    : [vendor.cover_url, vendor.avatar_url].filter(Boolean) as string[];

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
                  <MapPin className="h-4 w-4" /> {vendor.city}{vendor.country ? `, ${vendor.country}` : ""}
                </span>
              )}
            </div>

            {vendor.bio && (
              <div className="mt-6">
                <h2 className="font-bold mb-2">About</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{vendor.bio}</p>
              </div>
            )}

            {/* Portfolio gallery */}
            <div className="mt-8">
              <h2 className="font-bold mb-3">Portfolio</h2>
              {gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {gallery.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-secondary">
                      <img src={url as string} alt={`${vendor.business_name} portfolio ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No portfolio images yet.</p>
              )}
            </div>

            {/* Contact + social */}
            <div className="mt-8">
              <h2 className="font-bold mb-3">Contact & Social</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {vendor.email && (
                  <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/60 hover:bg-secondary text-sm">
                    <Mail className="h-4 w-4 text-primary" /> <span className="truncate">{vendor.email}</span>
                  </a>
                )}
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/60 hover:bg-secondary text-sm">
                    <Phone className="h-4 w-4 text-primary" /> {vendor.phone}
                  </a>
                )}
                {vendor.website && (
                  <a href={vendor.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-secondary/60 hover:bg-secondary text-sm">
                    <Globe className="h-4 w-4 text-primary" /> <span className="truncate">Website</span>
                  </a>
                )}
                {vendor.instagram_url && (
                  <a href={vendor.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-secondary/60 hover:bg-secondary text-sm">
                    <Instagram className="h-4 w-4 text-primary" /> Instagram
                  </a>
                )}
                {vendor.tiktok_url && (
                  <a href={vendor.tiktok_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-secondary/60 hover:bg-secondary text-sm">
                    <span className="h-4 w-4 text-primary inline-flex items-center justify-center font-extrabold text-[10px]">TT</span> TikTok
                  </a>
                )}
                {vendor.twitter_url && (
                  <a href={vendor.twitter_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-secondary/60 hover:bg-secondary text-sm">
                    <Twitter className="h-4 w-4 text-primary" /> X / Twitter
                  </a>
                )}
              </div>
            </div>

            {/* Related packages */}
            {relatedPackages.length > 0 && (
              <div className="mt-10">
                <h2 className="font-bold mb-3">Featured in these packages</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedPackages.slice(0, 4).map((p) => (
                    <PackageCard key={p.id} pkg={p} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="md:sticky md:top-24 h-fit">
            <div className="rounded-2xl border border-border p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Starting from</p>
              <p className="text-3xl font-extrabold text-foreground mt-1 mb-4">
                {formatPrice(String(vendor.base_price))}
              </p>
              <Button className="w-full rounded-xl font-bold gap-2" onClick={() => setBookingOpen(true)}>
                <MessageSquare className="h-4 w-4" /> Request to book
              </Button>
              <p className="text-[11px] text-muted-foreground mt-3 text-center">
                Track every booking from <Link to="/dashboard" className="underline">your dashboard</Link>.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        title={vendor.business_name}
        basePrice={Number(vendor.base_price)}
        vendorId={vendor.id}
      />

      <Footer />
    </div>
  );
};

export default VendorProfile;
