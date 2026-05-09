import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { useBrands } from "@/hooks/useBrands";
import { useCurrency } from "@/contexts/CurrencyContext";

const Brands = () => {
  const navigate = useNavigate();
  const { data = [] } = useBrands();
  const { formatPrice } = useCurrency();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-extrabold mb-2">Brands looking to sponsor</h1>
        <p className="text-muted-foreground mb-6">Browse brand profiles, their target events, and budget windows.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((b) => (
            <button key={b.id} onClick={() => navigate(`/sponsorships/brands/${b.id}`)} className="text-left rounded-2xl bg-card border border-border p-5 hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-3">
                {b.logo_url ? <img src={b.logo_url} className="h-12 w-12 rounded-xl object-cover" alt="" /> : <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center font-bold text-primary">{b.name[0]}</div>}
                <div>
                  <div className="font-bold">{b.name}</div>
                  <div className="text-[11px] text-muted-foreground">{b.industry}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{b.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {b.target_event_types?.slice(0, 4).map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
              </div>
              <Badge variant="outline" className="text-[10px]">{formatPrice(String(b.budget_min))} – {formatPrice(String(b.budget_max))}</Badge>
            </button>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Brands;
