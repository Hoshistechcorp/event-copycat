import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Sparkles, Check, MapPin, Heart } from "lucide-react";
import { usePackage } from "@/hooks/usePackages";
import { useCurrency } from "@/contexts/CurrencyContext";
import BookingDialog from "@/components/bloov/BookingDialog";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

const VIBES = ["luxury", "intimate", "viral", "traditional", "minimal", "festival"];

const PackageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pkg, isLoading } = usePackage(id);
  const { formatPrice } = useCurrency();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [guests, setGuests] = useState<number[]>([0]);
  const [city, setCity] = useState("");
  const [vibe, setVibe] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-5xl px-4 py-16 animate-pulse">
          <div className="h-72 rounded-3xl bg-muted mb-6" />
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-5xl px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">Package not found.</p>
          <Button onClick={() => navigate("/bloov-service")}>Back to marketplace</Button>
        </div>
      </div>
    );
  }

  const baseCapacity = pkg.guest_capacity;
  const targetGuests = guests[0] || baseCapacity;
  // Linear scaling beyond base capacity (10% of base price per 10% extra guests).
  const scale = Math.max(1, targetGuests / baseCapacity);
  const adjustedPrice = Math.round(Number(pkg.base_price) * scale);

  const customNotes = [
    targetGuests !== baseCapacity ? `Adjusted to ${targetGuests} guests` : null,
    city ? `City: ${city}` : null,
    vibe ? `Vibe: ${vibe}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-5xl px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="relative aspect-[16/7] rounded-3xl overflow-hidden bg-secondary mb-6">
          {pkg.hero_image_url && (
            <img src={pkg.hero_image_url} alt={pkg.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider mb-2">
              {pkg.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">{pkg.title}</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <p className="text-muted-foreground text-base leading-relaxed">{pkg.description}</p>

            <div className="flex flex-wrap gap-3 mt-6">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm font-semibold">
                <Users className="h-4 w-4" /> Base {pkg.guest_capacity} guests
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm font-semibold">
                <Sparkles className="h-4 w-4" /> {pkg.included_vendor_categories.length} services included
              </span>
            </div>

            <div className="mt-8">
              <h2 className="font-bold mb-3">What's included</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {pkg.included_vendor_categories.map((cat) => (
                  <div key={cat} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm capitalize">{cat.replace("-", " ")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customization */}
            <div className="mt-8 rounded-2xl border border-border p-5 space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Customize</p>
                <h3 className="font-bold">Adjust this package to your event</h3>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Guests: <span className="text-foreground">{targetGuests}</span>
                </label>
                <Slider value={[targetGuests]} onValueChange={setGuests} min={20} max={Math.max(2000, baseCapacity * 4)} step={10} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> City
                  </label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city — anywhere in the world" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5" /> Vibe
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {VIBES.map((v) => (
                      <button
                        key={v}
                        onClick={() => setVibe(vibe === v ? null : v)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${vibe === v ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="md:sticky md:top-24 h-fit">
            <div className="rounded-2xl border border-border p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Your price</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{formatPrice(String(adjustedPrice))}</p>
              {adjustedPrice !== Number(pkg.base_price) && (
                <p className="text-[11px] text-muted-foreground mb-1">Base {formatPrice(String(pkg.base_price))} · scaled for {targetGuests} guests</p>
              )}
              <p className="text-[11px] text-muted-foreground mb-4">Deposit {formatPrice(String(Math.round(adjustedPrice * 0.2)))}</p>
              <Button className="w-full rounded-xl font-bold" onClick={() => setBookingOpen(true)}>
                Book this package
              </Button>
              <BookingDialog
                open={bookingOpen}
                onOpenChange={setBookingOpen}
                title={pkg.title}
                basePrice={adjustedPrice}
                packageId={pkg.id}
                prefilledNotes={customNotes}
              />
              <p className="text-[11px] text-muted-foreground mt-3 text-center">
                Pay deposit · Flex-it installments available
              </p>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PackageDetail;
