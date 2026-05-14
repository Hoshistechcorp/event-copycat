import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { EventItem } from "@/data/events";

function mapDbToEventItem(db: any): EventItem & {
  event_format?: string;
  online_url?: string | null;
  visibility?: string;
  requires_rsvp?: boolean;
  is_paid?: boolean;
  currency?: string;
  location_reveal?: string;
  reveal_hours_before?: number;
  end_date?: string | null;
  date_iso?: string;
  host_id?: string;
  open_to_sponsorship?: boolean;
  donate_flexit_url?: string | null;
  donate_flexit_qr_url?: string | null;
  refund_policy?: string | null;
} {
  const eventDate = new Date(db.date);
  const monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const fullMonthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const dateStr = `${monthNames[eventDate.getMonth()]} ${eventDate.getDate()}`;
  const fullDate = `${dayNames[eventDate.getDay()]}, ${fullMonthNames[eventDate.getMonth()]} ${eventDate.getDate()}, ${eventDate.getFullYear()}`;
  const time = eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const tiers = db.ticket_tiers || [];
  const performers = db.performers || [];
  const lowestPrice = tiers.length > 0 ? Math.min(...tiers.map((t: any) => t.price)) : 0;
  const currency = db.currency || "NGN";
  const priceStr = lowestPrice === 0 ? "Free" : `${currency} ${lowestPrice.toLocaleString()}`;

  return {
    id: db.id as any,
    title: db.title,
    organizer: "Event Host",
    date: dateStr,
    fullDate,
    time,
    price: priceStr,
    image: db.image_url || "/placeholder.svg",
    vibing: `${Math.floor(Math.random() * 50 + 20)}+`,
    verified: false,
    category: (db.category || "Parties") as any,
    location: (db.venue_address?.split(",").pop()?.trim() || db.venue || "Online") as any,
    venue: db.venue || "Online",
    description: db.description || "",
    tickets: tiers.length > 0
      ? tiers.map((t: any) => ({
          name: t.name,
          tierId: t.id,
          price: t.price === 0 ? "Free" : `${currency} ${t.price.toLocaleString()}`,
          rawPrice: Number(t.price) || 0,
          test_fee_percent: Number(t.test_fee_percent) || 0,
          perks: t.description ? t.description.split(",").map((s: string) => s.trim()) : ["General admission"],
        }))
      : [{ name: "General Admission", price: "Free", rawPrice: 0, test_fee_percent: 0, perks: ["General admission"] }],
    performers: performers.map((p: any) => ({
      name: p.name,
      role: p.role || "Performer",
      avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`,
    })),
    coordinates: { lat: 6.5244, lng: 3.3792 },
    event_format: db.event_format,
    online_url: db.online_url,
    visibility: db.visibility,
    requires_rsvp: db.requires_rsvp,
    is_paid: db.is_paid,
    currency,
    location_reveal: db.location_reveal,
    reveal_hours_before: db.reveal_hours_before,
    end_date: db.end_date,
    date_iso: db.date,
    host_id: db.host_id,
    open_to_sponsorship: db.open_to_sponsorship,
    donate_flexit_url: db.donate_flexit_url,
    donate_flexit_qr_url: db.donate_flexit_qr_url,
    refund_policy: db.refund_policy,
  };
}

export function useDbEvents() {
  return useQuery({
    queryKey: ["db-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`*, ticket_tiers(*), performers(*)`)
        .eq("status", "published")
        .eq("visibility", "public");
      if (error) { console.error(error); return []; }
      return (data || []).map(mapDbToEventItem);
    },
  });
}

export function useDbEvent(id: string) {
  return useQuery({
    queryKey: ["db-event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`*, ticket_tiers(*), performers(*)`)
        .eq("id", id)
        .single();
      if (error) return null;
      return mapDbToEventItem(data);
    },
    enabled: !!id,
  });
}
