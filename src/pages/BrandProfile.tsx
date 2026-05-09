import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe } from "lucide-react";
import { useBrand } from "@/hooks/useBrands";
import { useCurrency } from "@/contexts/CurrencyContext";

const BrandProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: b, isLoading } = useBrand(id);
  const { formatPrice } = useCurrency();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-sm">Loading…</div>;
  if (!b) return <div className="min-h-screen flex items-center justify-center text-sm">Brand not found.</div>;
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl px-4 py-10">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <div className="flex items-center gap-4 mb-6">
          {b.logo_url ? <img src={b.logo_url} className="h-20 w-20 rounded-2xl object-cover" alt="" /> : <div className="h-20 w-20 rounded-2xl bg-primary/15 flex items-center justify-center font-bold text-2xl text-primary">{b.name[0]}</div>}
          <div>
            <h1 className="text-3xl font-extrabold">{b.name}</h1>
            <p className="text-sm text-muted-foreground">{b.industry} {b.hq_city && `• ${b.hq_city}, ${b.hq_country}`}</p>
            {b.website && <a href={b.website} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1 mt-1"><Globe className="h-3 w-3" /> {b.website}</a>}
          </div>
        </div>
        <p className="mb-6">{b.description}</p>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold mb-2 text-sm">Budget window</h3>
            <Badge>{formatPrice(String(b.budget_min))} – {formatPrice(String(b.budget_max))}</Badge>
          </div>
          {b.target_event_types?.length > 0 && (
            <div>
              <h3 className="font-bold mb-2 text-sm">Target event types</h3>
              <div className="flex flex-wrap gap-1">{b.target_event_types.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
            </div>
          )}
          {b.target_audience?.length > 0 && (
            <div>
              <h3 className="font-bold mb-2 text-sm">Target audience</h3>
              <div className="flex flex-wrap gap-1">{b.target_audience.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}</div>
            </div>
          )}
          {b.preferred_styles?.length > 0 && (
            <div>
              <h3 className="font-bold mb-2 text-sm">Preferred event style</h3>
              <div className="flex flex-wrap gap-1">{b.preferred_styles.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}</div>
            </div>
          )}
          {b.preferred_locations?.length > 0 && (
            <div>
              <h3 className="font-bold mb-2 text-sm">Preferred locations</h3>
              <div className="flex flex-wrap gap-1">{b.preferred_locations.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}</div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrandProfile;
