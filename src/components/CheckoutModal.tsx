import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Minus, Plus, Loader2 } from "lucide-react";
import type { EventItem } from "@/data/events";
import type { PurchasedTicket } from "@/pages/MyTickets";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventItem;
  selectedTicketIndex: number;
}

const CheckoutModal = ({ open, onOpenChange, event, selectedTicketIndex }: CheckoutModalProps) => {
  const ticket = event.tickets[selectedTicketIndex];
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"details" | "processing" | "success">("details");
  const navigate = useNavigate();
  const { formatPrice, convertAmount } = useCurrency();

  const handlePurchase = () => {
    if (!name.trim() || !email.trim()) return;
    setStep("processing");

    setTimeout(() => {
      const purchased: PurchasedTicket = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        eventId: event.id,
        ticketType: ticket.name,
        price: ticket.price,
        quantity,
        purchasedAt: new Date().toISOString(),
        name,
        email,
      };

      const existing = JSON.parse(localStorage.getItem("purchased_tickets") || "[]");
      existing.push(purchased);
      localStorage.setItem("purchased_tickets", JSON.stringify(existing));

      setStep("success");
    }, 1500);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("details");
      setQuantity(1);
      setName("");
      setEmail("");
    }, 300);
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
          <div className="space-y-5">
            {/* Ticket summary */}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-card-foreground">{event.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{event.fullDate} · {event.time}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{ticket.name}</span>
                <span className="text-sm font-extrabold text-primary">{formatPrice(ticket.price)}</span>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-sm font-bold w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Full Name</label>
                <Input
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button
              className="w-full rounded-xl h-12 text-sm font-bold"
              onClick={handlePurchase}
              disabled={!name.trim() || !email.trim()}
            >
              {ticket.price === "Free" || ticket.price.toLowerCase() === "free"
                ? `Get ${quantity} Ticket${quantity > 1 ? "s" : ""}`
                : `Pay ${(() => {
                    const num = Number(ticket.price.replace(/[^0-9]/g, ""));
                    const total = num * quantity;
                    return formatPrice(`₦${total}`);
                  })()}`}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Secure checkout · Instant confirmation
            </p>
          </div>
        )}

        {step === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-sm font-semibold text-foreground">Processing your order...</p>
            <p className="text-xs text-muted-foreground mt-1">Please wait a moment</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Ticket purchased successfully!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Confirmation sent to {email}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={handleClose}>
                Back to event
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={() => {
                  handleClose();
                  navigate("/my-tickets");
                }}
              >
                View my tickets
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
