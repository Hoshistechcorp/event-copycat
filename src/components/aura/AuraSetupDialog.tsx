import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import type { AuraProduct } from "@/lib/auraProducts";
import { useAuraLinks } from "@/hooks/useAuraLinks";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Props {
  product: AuraProduct | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const SHARED_DATA = ["Identity", "Flex-it Wallet", "Reputation Score"];

const AuraSetupDialog = ({ product, open, onOpenChange }: Props) => {
  const { link } = useAuraLinks();
  const navigate = useNavigate();

  if (!product) return null;
  const Icon = product.icon;

  const handleSync = async () => {
    try {
      await link.mutateAsync(product.id);
      toast({ title: `${product.name} initialized`, description: "Synced via AuraLink." });
      onOpenChange(false);
      navigate(product.route);
    } catch (e: any) {
      toast({ title: "Could not initialize", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 sm:max-w-md">
        <DialogHeader>
          <div className={`mx-auto h-14 w-14 rounded-2xl bg-card border border-white/10 flex items-center justify-center mb-2 ${product.glow}`}>
            <Icon className={`h-7 w-7 ${product.color}`} />
          </div>
          <DialogTitle className="text-center text-2xl font-extrabold">Initialize {product.name}</DialogTitle>
          <DialogDescription className="text-center">{product.description}</DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl bg-secondary/50 border border-border p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> Data shared via AuraLink
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 pl-6 list-disc">
            {SHARED_DATA.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>

        <Button onClick={handleSync} disabled={link.isPending} className={`w-full font-bold rounded-xl ${product.glow}`}>
          {link.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          1-Click Sync via AuraLink
        </Button>
        <p className="text-[10px] text-center text-muted-foreground">You can disconnect anytime from your AuraLink dashboard.</p>
      </DialogContent>
    </Dialog>
  );
};

export default AuraSetupDialog;
