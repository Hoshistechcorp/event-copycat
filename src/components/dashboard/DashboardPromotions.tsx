import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Sparkles, Star, Zap, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays } from "date-fns";

interface Event {
  id: string;
  title: string;
  date: string;
  status: string;
  image_url: string | null;
}

interface DashboardPromotionsProps {
  events: Event[];
}

const plans = [
  {
    name: "Banner Boost",
    placement: "banner",
    price: "₦5,000",
    priceValue: 5000,
    duration: "7 days",
    durationDays: 7,
    icon: <Zap className="h-5 w-5" />,
    description: "Feature on the Events page banner carousel",
    features: ["Events page banner", "7-day duration", "Priority display"],
  },
  {
    name: "Hero Spotlight",
    placement: "hero",
    price: "₦10,000",
    priceValue: 10000,
    duration: "14 days",
    durationDays: 14,
    icon: <Star className="h-5 w-5" />,
    description: "Appear on the homepage hero cards",
    features: ["Homepage hero section", "14-day duration", "Maximum visibility"],
    popular: true,
  },
  {
    name: "Full Promotion",
    placement: "both",
    price: "₦12,000",
    priceValue: 12000,
    duration: "14 days",
    durationDays: 14,
    icon: <Sparkles className="h-5 w-5" />,
    description: "Both banner and hero card placement",
    features: ["Homepage + Events page", "14-day duration", "Best value"],
  },
];

const DashboardPromotions = ({ events }: DashboardPromotionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [promoting, setPromoting] = useState(false);

  const publishedEvents = events.filter((e) => e.status === "published");

  const handlePromote = async (plan: typeof plans[0]) => {
    if (!selectedEvent) {
      toast({ title: "Select an event", description: "Choose an event to promote first.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setPromoting(true);
    const { error } = await supabase.from("promotions").insert({
      event_id: selectedEvent,
      host_id: user.id,
      placement: plan.placement,
      status: "active",
      start_date: new Date().toISOString(),
      end_date: addDays(new Date(), plan.durationDays).toISOString(),
      amount_paid: plan.priceValue,
    });

    if (error) {
      toast({ title: "Promotion failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event promoted!", description: `Your event will appear on ${plan.placement === "both" ? "banner & hero" : plan.placement} for ${plan.duration}.` });
    }
    setPromoting(false);
  };

  return (
    <div className="space-y-6">
      {/* Select event */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold text-foreground">Promote an Event</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Select a published event to boost its visibility</p>
          </CardHeader>
          <CardContent>
            {publishedEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No published events</p>
                <p className="text-xs text-muted-foreground">Publish an event first to promote it.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {publishedEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedEvent === event.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="h-10 w-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <CalendarDays className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(event.date), "MMM d, yyyy")}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Promotion plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, i) => (
          <motion.div key={plan.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
            <Card className={`rounded-2xl border-border relative ${plan.popular ? "ring-2 ring-primary" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full text-[10px] px-3 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardContent className="p-5 pt-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  {plan.icon}
                </div>
                <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">{plan.description}</p>
                <p className="text-2xl font-extrabold text-foreground mb-1">{plan.price}</p>
                <p className="text-xs text-muted-foreground mb-4">{plan.duration}</p>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full rounded-xl font-bold text-xs"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={promoting || !selectedEvent}
                  onClick={() => handlePromote(plan)}
                >
                  {promoting ? "Processing..." : "Promote Now"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPromotions;
