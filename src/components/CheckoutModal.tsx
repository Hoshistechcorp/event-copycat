import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Minus, Plus, Loader2, Tag, X, ShieldCheck, Sparkles, FlaskConical } from "lucide-react";
import type { EventItem } from "@/data/events";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventItem & { id: any; currency?: string; refund_policy?: string | null };
  selectedTicketIndex: number;
}

const CheckoutModal = ({ open, onOpenChange, event, selectedTicketIndex }: CheckoutModalProps) => {
  const ticket: any = event.tickets[selectedTicketIndex];
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ id: string; code: string; discount_type: string; value: number; max_uses: number | null; used_count: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [step, setStep] = useState<"details" | "processing" | "success">("details");
  const [refundOpen, setRefundOpen] = useState(false);
  const navigate = useNavigate();

  const currency = event.currency || "NGN";
  const isTestRun = typeof event.title === "string" && /^\[Test Run\]/i.test(event.title);
  const testFeePct = Number(ticket.test_fee_percent) || 0;
  const fullPrice = Number(ticket.rawPrice ?? 0);
  const unitPrice = isTestRun && testFeePct > 0 ? Math.round((fullPrice * testFeePct) / 100) : fullPrice;
  const subtotal = unitPrice * quantity;

  const { discount, discountLabel } = useMemo(() => {
    if (!promoApplied) return { discount: 0, discountLabel: "" };
    if (promoApplied.discount_type === "percent") {
      return { discount: Math.round((subtotal * promoApplied.value) / 100), discountLabel: `${promoApplied.value}% off` };
    }
    return { discount: Math.min(subtotal, promoApplied.value * quantity), discountLabel: `${currency} ${promoApplied.value.toLocaleString()} off / ticket` };
  }, [promoApplied, subtotal, quantity, currency]);

  const total = Math.max(0, subtotal - discount);
  const fmt = (n: number) => unitPrice === 0 ? "Free" : `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const remainingUses = promoApplied?.max_uses ? Math.max(0, promoApplied.max_uses - promoApplied.used_count) : null;

  const applyPromo = async () => {
    setPromoError("");
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    const { data, error } = await supabase
      .from("promo_codes")
      .select("id, code, discount_type, value, max_uses, used_count, expires_at, active")
      .eq("event_id", event.id)
      .eq("code", promoInput.trim().toUpperCase())
      .maybeSingle();
    setPromoLoading(false);
    if (error || !data) { setPromoError("Code not found"); return; }
    if (!data.active) { setPromoError("Code is inactive"); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setPromoError("Code has expired"); return; }
    if (data.max_uses && data.used_count >= data.max_uses) { setPromoError("Code limit reached"); return; }
    setPromoApplied({ id: data.id, code: data.code, discount_type: data.discount_type, value: Number(data.value), max_uses: data.max_uses, used_count: data.used_count });
    toast({ title: `Promo ${data.code} applied`, description: data.discount_type === "percent" ? `${data.value}% off your order` : `${currency} ${data.value} off per ticket` });
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
    setTimeout(() => { setStep("details"); setQuantity(1); setName(""); setPromoApplied(null); setPromoInput(""); setPromoError(""); }, 300);
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
                <div className="text-right">
                  {isTestRun && testFeePct > 0 && fullPrice > 0 && (
                    <span className="text-[10px] text-muted-foreground line-through mr-2">{currency} {fullPrice.toLocaleString()}</span>
                  )}
                  <span className="text-sm font-extrabold text-primary">{fmt(unitPrice)}</span>
                </div>
              </div>
              {isTestRun && testFeePct > 0 && (
                <p className="text-[10px] font-semibold text-amber-700 mt-2">Test Run contribution · {testFeePct}% of full price · refundable if event is cancelled</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="w-3 h-3" /></Button>
                <span className="text-sm font-bold w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQuantity(Math.min(10, quantity + 1))}><Plus className="w-3 h-3" /></Button>
                <span className="text-[10px] text-muted-foreground ml-2">Max 10 per order</span>
              </div>
            </div>

            <div className="space-y-2">
              <Input placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
              <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
            </div>

            {unitPrice > 0 && (
              <div>
                {promoApplied ? (
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-extrabold text-primary tracking-wide">{promoApplied.code}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">{discountLabel}</span>
                      </div>
                      <button onClick={() => { setPromoApplied(null); setPromoInput(""); }} aria-label="Remove promo">
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>You save {fmt(discount)}</span>
                      {remainingUses !== null && <span>{remainingUses} use{remainingUses === 1 ? "" : "s"} left</span>}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input placeholder="Promo code" value={promoInput} onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }} className="rounded-xl h-9 text-sm font-mono uppercase" />
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={applyPromo} disabled={promoLoading || !promoInput.trim()}>
                      {promoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Tag className="h-3 w-3 mr-1" /> Apply</>}
                    </Button>
                  </div>
                )}
                {promoError && <p className="text-[10px] text-destructive mt-1">{promoError}</p>}
              </div>
            )}

            <div className="space-y-1.5 text-xs pt-3 border-t border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{ticket.name} × {quantity}</span>
                <span className="font-medium">{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Promo {promoApplied?.code}</span>
                  <span className="font-medium">−{fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Service fee</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between text-base font-extrabold pt-2 border-t border-border mt-1">
                <span>Total ({currency})</span>
                <span>{fmt(total)}</span>
              </div>
            </div>

            <Button className="w-full rounded-xl h-12 text-sm font-bold" onClick={handlePurchase} disabled={!name.trim() || !email.trim()}>
              {unitPrice === 0 ? `Reserve ${quantity} Ticket${quantity > 1 ? "s" : ""}` : `Pay ${fmt(total)}`}
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" /> Secure checkout · Instant QR confirmation
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-sm font-semibold">Processing your order...</p>
            <p className="text-[11px] text-muted-foreground mt-1">Charging {fmt(total)}</p>
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
