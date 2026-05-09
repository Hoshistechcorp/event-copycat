// Currency-aware payment routing. Returns the recommended gateway for a given currency.
// Real charge integrations are deferred — this layer keeps the UI ready for them.
export type Gateway = "stripe" | "stripe_connect" | "paystack" | "flutterwave" | "wise";

export interface GatewayInfo {
  gateway: Gateway;
  label: string;
  reason: string;
}

const GATEWAY_LABELS: Record<Gateway, string> = {
  stripe: "Stripe",
  stripe_connect: "Stripe Connect",
  paystack: "Paystack",
  flutterwave: "Flutterwave",
  wise: "Wise",
};

export function routeGateway(currency: string, country?: string): GatewayInfo {
  const c = (currency || "USD").toUpperCase();
  if (c === "NGN") return { gateway: "paystack", label: GATEWAY_LABELS.paystack, reason: "Local NGN settlement via Paystack." };
  if (["GHS", "KES", "ZAR"].includes(c))
    return { gateway: "flutterwave", label: GATEWAY_LABELS.flutterwave, reason: `Optimised African corridor for ${c}.` };
  if (["INR", "BRL"].includes(c))
    return { gateway: "wise", label: GATEWAY_LABELS.wise, reason: `Cross-border payout in ${c} via Wise.` };
  if (["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "AED"].includes(c))
    return { gateway: "stripe_connect", label: GATEWAY_LABELS.stripe_connect, reason: `Stripe Connect direct payout in ${c}.` };
  return { gateway: "stripe", label: GATEWAY_LABELS.stripe, reason: "Default Stripe processing." };
}
