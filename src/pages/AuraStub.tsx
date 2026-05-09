import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Orbit } from "lucide-react";
import type { AuraProduct } from "@/lib/auraProducts";
import { useAuraLinks } from "@/hooks/useAuraLinks";

interface Props { product: AuraProduct }

const AuraStub = ({ product }: Props) => {
  const navigate = useNavigate();
  const Icon = product.icon;
  const { isLinked, link } = useAuraLinks();
  const linked = isLinked(product.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 opacity-30 blur-3xl ${product.glow}`} />
        <div className="container max-w-4xl px-4 py-20 relative">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className={`mx-auto h-20 w-20 rounded-3xl bg-card border border-white/10 flex items-center justify-center mb-5 ${product.glow}`}>
              <Icon className={`h-10 w-10 ${product.color}`} />
            </div>
            <Badge variant="secondary" className="text-[10px] mb-3">{product.tagline.toUpperCase()}</Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{product.name}</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">{product.description}</p>

            <div className="rounded-3xl bg-card border border-white/10 p-8 max-w-md mx-auto">
              <Orbit className={`h-6 w-6 mx-auto mb-2 ${product.color}`} />
              <h2 className="font-extrabold text-xl mb-2">Coming soon to AURA</h2>
              <p className="text-sm text-muted-foreground mb-5">
                {product.name} is launching soon. {linked ? "You're synced — we'll notify you the moment it goes live." : "Sync with AuraLink to be first in line."}
              </p>
              {!linked && !product.alwaysLinked && (
                <Button onClick={() => link.mutate(product.id)} className={`w-full font-bold rounded-xl ${product.glow}`}>
                  <Orbit className="h-4 w-4 mr-2" /> 1-Click Sync via AuraLink
                </Button>
              )}
              {linked && (
                <Badge className="bg-primary/15 text-primary border-primary/20">Connected via AuraLink</Badge>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AuraStub;
