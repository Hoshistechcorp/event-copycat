import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useCurrency, currencies } from "@/contexts/CurrencyContext";
import { routeGateway } from "@/lib/paymentRouter";
import { Badge } from "@/components/ui/badge";

const ProfileCurrency = () => {
  const { currency, setCurrency } = useCurrency();
  const gw = routeGateway(currency.code);

  return (
    <Card className="rounded-2xl border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-bold">Display Currency</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Choose how prices are displayed across iBloov. Payouts are routed automatically based on your currency.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => setCurrency(c)}
              className={`text-left p-3 rounded-xl border transition-all ${
                currency.code === c.code
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-secondary/50"
              }`}
            >
              <div className="text-sm font-bold">{c.symbol} {c.code}</div>
              <div className="text-[10px] text-muted-foreground truncate">{c.name}</div>
            </button>
          ))}
        </div>
        <div className="rounded-xl bg-secondary/40 px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold">Payout rail</div>
            <div className="text-[11px] text-muted-foreground">{gw.reason}</div>
          </div>
          <Badge variant="outline" className="font-bold">{gw.label}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCurrency;
