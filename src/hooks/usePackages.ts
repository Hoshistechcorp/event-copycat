import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EventPackage {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  base_price: number;
  currency: string;
  guest_capacity: number;
  hero_image_url: string | null;
  gallery_urls: string[];
  included_vendor_categories: string[];
  timeline_json: unknown;
  is_published: boolean;
}

export const usePackages = () =>
  useQuery({
    queryKey: ["event-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_packages")
        .select("*")
        .eq("is_published", true)
        .order("base_price");
      if (error) throw error;
      return data as EventPackage[];
    },
  });

export const usePackage = (slug?: string) =>
  useQuery({
    queryKey: ["event-package", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_packages")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as EventPackage | null;
    },
  });
