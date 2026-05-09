import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateBooking } from "@/hooks/useBookings";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { routeGateway } from "@/lib/paymentRouter";
import { Badge } from "@/components/ui/badge";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  basePrice: number;
  vendorId?: string;
  packageId?: string;
  prefilledNotes?: string;
}

const BookingDialog = ({ open, onOpenChange, title, basePrice, vendorId, packageId, prefilledNotes }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatPrice, currency } = useCurrency();
  const gw = routeGateway(currency.code);
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState(prefilledNotes ?? "");
  const create = useCreateBooking();
  const deposit = Math.round(basePrice * 0.2);

  useEffect(() => {
    if (prefilledNotes !== undefined) setNotes(prefilledNotes);
  }, [prefilledNotes]);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Create an account to place a booking." });
      navigate("/signin");
      return;
    }
    try {
      await create.mutateAsync({
        vendor_id: vendorId,
        package_id: packageId,
        event_date: eventDate || null,
        total_amount: basePrice,
        deposit_amount: deposit,
        notes: notes || null,
      });
      toast({ title: "Booking request sent", description: "Track its status from your dashboard." });
      onOpenChange(false);
      setEventDate("");
      setNotes("");
    } catch (e: any) {
      toast({ title: "Could not place booking", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book {title}</DialogTitle>
          <DialogDescription>
            Send a request — pay a {formatPrice(String(deposit))} deposit to confirm. Total: {formatPrice(String(basePrice))}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="event-date">Preferred event date</Label>
            <Input id="event-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="notes">Notes for the vendor</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Guest count, theme, special requests..."
              maxLength={500}
            />
          </div>
          <div className="rounded-xl bg-secondary/40 px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Payment routed via</span>
            <Badge variant="outline" className="text-[10px] font-bold">{gw.label}</Badge>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={create.isPending} className="font-bold">
            {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
