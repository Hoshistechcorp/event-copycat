import { useState } from "react";
import { useMyBookings, useIncomingBookings, useUpdateBookingStatus } from "@/hooks/useBookings";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Loader2, Inbox, Calendar, Package as PackageIcon, Store, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  confirmed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  declined: "bg-destructive/15 text-destructive",
  completed: "bg-primary/15 text-primary",
  cancelled: "bg-muted text-muted-foreground",
};

type Mode = "outgoing" | "incoming";

const DashboardBookings = () => {
  const [mode, setMode] = useState<Mode>("outgoing");
  const { data: outgoing = [], isLoading: lOut } = useMyBookings();
  const { data: incoming = [], isLoading: lIn } = useIncomingBookings();
  const update = useUpdateBookingStatus();
  const { formatPrice } = useCurrency();

  const bookings = mode === "outgoing" ? outgoing : incoming;
  const isLoading = mode === "outgoing" ? lOut : lIn;

  const handleStatus = async (id: string, status: "confirmed" | "declined") => {
    try {
      await update.mutateAsync({ id, status });
      toast({ title: status === "confirmed" ? "Booking confirmed" : "Booking declined" });
    } catch (e: any) {
      toast({ title: "Could not update booking", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="inline-flex p-1 rounded-xl bg-secondary">
        {(["outgoing", "incoming"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            {m === "outgoing" ? `My requests (${outgoing.length})` : `Incoming (${incoming.length})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-1">
            {mode === "outgoing" ? "No bookings yet" : "No incoming requests"}
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            {mode === "outgoing"
              ? "Browse Bloov Service to book vendors and packages."
              : "Once clients request your vendor profile, requests appear here."}
          </p>
          {mode === "outgoing" && (
            <Button asChild className="rounded-xl font-bold">
              <Link to="/bloov-service">Open Bloov Service</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const target = b.event_packages
              ? { title: b.event_packages.title, image: b.event_packages.hero_image_url, icon: PackageIcon, type: "Package" }
              : b.vendors
              ? { title: b.vendors.business_name, image: b.vendors.avatar_url, icon: Store, type: "Vendor" }
              : { title: "Booking", image: null, icon: Inbox, type: "Item" };
            const Icon = target.icon;
            const style = STATUS_STYLES[b.status] ?? STATUS_STYLES.requested;
            const showActions = mode === "incoming" && b.status === "requested";
            return (
              <div key={b.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-border bg-card">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary flex items-center justify-center shrink-0">
                  {target.image ? (
                    <img src={target.image} alt={target.title} className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{target.type}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="font-bold text-sm truncate">{target.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                    {b.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {format(new Date(b.event_date), "PPP")}
                      </span>
                    )}
                    <span>Requested {format(new Date(b.created_at), "MMM d")}</span>
                  </div>
                  {b.notes && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">"{b.notes}"</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-extrabold">{formatPrice(String(b.total_amount))}</p>
                    <p className="text-[10px] text-muted-foreground">Deposit {formatPrice(String(b.deposit_amount))}</p>
                  </div>
                  {showActions && (
                    <div className="flex flex-col gap-1.5">
                      <Button size="sm" className="rounded-lg gap-1" onClick={() => handleStatus(b.id, "confirmed")} disabled={update.isPending}>
                        <Check className="h-3.5 w-3.5" /> Confirm
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg gap-1" onClick={() => handleStatus(b.id, "declined")} disabled={update.isPending}>
                        <X className="h-3.5 w-3.5" /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardBookings;
