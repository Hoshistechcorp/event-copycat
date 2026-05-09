import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Sparkles, Check } from "lucide-react";
import { usePackage } from "@/hooks/usePackages";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "@/hooks/use-toast";

const PackageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pkg, isLoading } = usePackage(id);
  const { formatPrice } = useCurrency();

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
                <Users className="h-4 w-4" /> {pkg.guest_capacity} guests
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

            <div className="mt-8 p-5 rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
              Package customization, vendor swaps, and timeline editing arrive in Phase 8.
            </div>
          </div>

          <aside className="md:sticky md:top-24 h-fit">
            <div className="rounded-2xl border border-border p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Package price</p>
              <p className="text-3xl font-extrabold text-foreground mt-1 mb-4">
                {formatPrice(String(pkg.base_price))}
              </p>
              <Button
                className="w-full rounded-xl font-bold"
                onClick={() => toast({ title: "Booking coming soon", description: "Package booking ships in Phase 8." })}
              >
                Book this package
              </Button>
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
