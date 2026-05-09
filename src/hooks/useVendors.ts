import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VendorCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  sort_order: number;
}

export interface Vendor {
  id: string;
  category_id: string;
  business_name: string;
  tagline: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  base_price: number;
  currency: string;
  avatar_url: string | null;
  cover_url: string | null;
  portfolio_urls: string[];
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_published: boolean;
  email: string | null;
  phone: string | null;
  website: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
}

export const useVendorCategories = () =>
  useQuery({
    queryKey: ["vendor-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as VendorCategory[];
    },
  });

export const useVendors = (categorySlug?: string) =>
  useQuery({
    queryKey: ["vendors", categorySlug ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("vendors")
        .select("*, vendor_categories!inner(slug, name)")
        .eq("is_published", true)
        .order("rating", { ascending: false });
      if (categorySlug) {
        query = query.eq("vendor_categories.slug", categorySlug);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as (Vendor & { vendor_categories: { slug: string; name: string } })[];
    },
  });

export const useVendor = (id?: string) =>
  useQuery({
    queryKey: ["vendor", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*, vendor_categories(slug, name)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
