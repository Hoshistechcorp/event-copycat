import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EventIdea {
  id: string;
  title: string;
  concept: string | null;
  city: string | null;
  country: string | null;
  audience_type: string | null;
  est_attendance: number | null;
  est_ticket_price: number | null;
  currency: string;
  trend_score: number;
  hero_image_url: string | null;
  tags: string[];
}

export const useEventIdeas = () =>
  useQuery({
    queryKey: ["event-ideas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_ideas")
        .select("*")
        .order("trend_score", { ascending: false });
      if (error) throw error;
      return data as EventIdea[];
    },
  });
