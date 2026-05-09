import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Minus, Plus, Loader2, Tag, X } from "lucide-react";
import type { EventItem } from "@/data/events";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventItem & { id: any; currency?: string };
  selectedTicketIndex: number;
}

const CheckoutModal = ({ open, onOpenChange, event, selectedTicketIndex }: CheckoutModalProps) => {
  const ticket: any = event.tickets[selectedTicketIndex];
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ id: string; code: string; discount_type: string; value: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [step, setStep] = useState<"details" | "processing" | "success">("details");
  const navigate = useNavigate();

  const currency = event.currency || "NGN";
  const unitPrice = Number(ticket.rawPrice ?? 0);
  const subtotal = unitPrice * quantity;
  const discount = promoApplied
    ? promoApplied.discount_type === "percent"
      ? Math.round((subtotal * promoApplied.value) / 100)
      : Math.min(subtotal, promoApplied.value)
    : 0;
  const total = Math.max(0, subtotal - discount);

  const fmt = (n: number) => unitPrice === 0 ? "Free" : `${currency} ${n.toLocaleString()}`;

  const applyPromo = async () => {
    setPromoError("");
    if (!promoInput.trim()) return;
    const { data, error } = await supabase
      .from("promo_codes")
      .select("id, code, discount_type, value, max_uses, used_count, expires_at, active")
      .eq("event_id", event.id)
      .eq("code", promoInput.trim().toUpperCase())
      .maybeSingle();
    if (error || !data) { setPromoError("Code not found"); return; }
    if (!data.active) { setPromoError("Code is inactive"); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setPromoError("Code has expired"); return; }
    if (data.max_uses && data.used_count >= data.max_uses) { setPromoError("Code limit reached"); return; }
    setPromoApplied({ id: data.id, code: data.code, discount_type: data.discount_type, value: Number(data.value) });
  };

  const isDbEvent = typeof event.id === "string" && /^[0-9a-f-]{36}$/i.test(event.id);

  const handlePurchase = async () => {
    if (!name.trim() || !email.trim()) return;
    if (!user) {
      toast({ title: "Please sign in to buy tickets", variant: "destructive" });
      navigate("/signin");
      return;
    }
    if (!isDbEvent) {
      toast({ title: "Demo event", description: "This is sample data — try a real event from the feed." });
      return;
    }
    setStep("processing");

    const { data, error } = await supabase.from("ticket_purchases").insert({
      event_id: event.id,
      ticket_tier_id: ticket.tierId,
      buyer_email: email.trim(),
      buyer_name: name.trim(),
      buyer_user_id: user.id,
      quantity,
      unit_price: unitPrice,
      total_amount: total,
      discount_amount: discount,
      promo_code_id: promoApplied?.id || null,
      status: "completed",
    }).select("id").single();

    if (error || !data) {
      setStep("details");
      toast({ title: "Purchase failed", description: error?.message, variant: "destructive" });
      return;
    }

    if (promoApplied) {
      const { data: pc } = await supabase.from("promo_codes").select("used_count").eq("id", promoApplied.id).single();
      if (pc) await supabase.from("promo_codes").update({ used_count: (pc.used_count || 0) + 1 }).eq("id", promoApplied.id);
    }

    setStep("success");
    setTimeout(() => {
      onOpenChange(false);
      navigate(`/my-tickets/${data.id}`);
    }, 1200);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setStep("details"); setQuantity(1); setName(""); setPromoApplied(null); setPromoInput(""); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {step === "success" ? "You're all set! 🎉" : "Complete your order"}
          </DialogTitle>
        </DialogHeader>

        {step === "details" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-sm font-bold">{event.title}</p>
              <p className="text-xs text-muted-foreground mb-2">{event.fullDate} · {event.time}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{ticket.name}</span>
                <span className="text-sm font-extrabold text-primary">{fmt(unitPrice)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="w-3 h-3" /></Button>
                <span className="text-sm font-bold w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQuantity(Math.min(10, quantity + 1))}><Plus className="w-3 h-3" /></Button>
              </div>
            </div>

            <div className="space-y-2">
              <Input placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
              <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
            </div>

            {unitPrice > 0 && (
              <div>
                {promoApplied ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 border border-primary/30">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-bold text-primary">{promoApplied.code}</span>
                      <span className="text-[10px] text-muted-foreground">
                        −{promoApplied.discount_type === "percent" ? `${promoApplied.value}%` : `${currency} ${promoApplied.value}`}
                      </span>
                    </div>
                    <button onClick={() => setPromoApplied(null)}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input placeholder="Promo code" value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} className="rounded-xl h-9 text-sm font-mono uppercase" />
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={applyPromo}>Apply</Button>
                  </div>
                )}
                {promoError && <p className="text-[10px] text-destructive mt-1">{promoError}</p>}
              </div>
            )}

            {unitPrice > 0 && (
              <div className="space-y-1 text-xs pt-2 border-t border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-primary"><span>Discount</span><span>−{fmt(discount)}</span></div>}
                <div className="flex justify-between text-sm font-extrabold pt-1"><span>Total</span><span>{fmt(total)}</span></div>
              </div>
            )}

            <Button className="w-full rounded-xl h-12 text-sm font-bold" onClick={handlePurchase} disabled={!name.trim() || !email.trim()}>
              {unitPrice === 0 ? `Reserve ${quantity} Ticket${quantity > 1 ? "s" : ""}` : `Pay ${fmt(total)}`}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">Secure checkout · Instant confirmation</p>
          </div>
        )}

        {step === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-sm font-semibold">Processing your order...</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><Check className="w-7 h-7 text-primary" /></div>
            <div>
              <p className="text-sm font-semibold">Ticket secured!</p>
              <p className="text-xs text-muted-foreground mt-1">Redirecting to your QR ticket...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
