import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { EventItem } from "@/data/events";

function mapDbToEventItem(db: any): EventItem {
  const eventDate = new Date(db.date);
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const dateStr = `${monthNames[eventDate.getMonth()]} ${eventDate.getDate()}`;
  const fullDate = `${dayNames[eventDate.getDay()]}, ${fullMonthNames[eventDate.getMonth()]} ${eventDate.getDate()}, ${eventDate.getFullYear()}`;
  const time = eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const tiers = db.ticket_tiers || [];
  const performers = db.performers || [];

  const lowestPrice = tiers.length > 0
    ? Math.min(...tiers.map((t: any) => t.price))
    : 0;
  const priceStr = lowestPrice === 0 ? "Free" : `₦${lowestPrice.toLocaleString()}`;

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
    location: (db.venue_address?.split(",").pop()?.trim() || "Lagos") as any,
    venue: db.venue,
    description: db.description || "",
    tickets: tiers.length > 0
      ? tiers.map((t: any) => ({
          name: t.name,
          price: t.price === 0 ? "Free" : `₦${t.price.toLocaleString()}`,
          perks: t.description ? t.description.split(",").map((s: string) => s.trim()) : ["General admission"],
        }))
      : [{ name: "General Admission", price: "Free", perks: ["General admission"] }],
    performers: performers.map((p: any) => ({
      name: p.name,
      role: p.role || "Performer",
      avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`,
    })),
    coordinates: { lat: 6.5244, lng: 3.3792 },
  };
}

export function useDbEvents() {
  return useQuery({
    queryKey: ["db-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`*, ticket_tiers(*), performers(*)`)
        .eq("status", "published");

      if (error) {
        console.error("Error fetching events:", error);
        return [];
      }
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
