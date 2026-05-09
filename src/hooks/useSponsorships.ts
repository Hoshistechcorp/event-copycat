import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SponsorshipListing {
  id: string;
  host_id: string;
  event_id: string | null;
  title: string;
  description: string | null;
  event_type: string | null;
  audience_size: number;
  demographics: any;
  asking_amount: number;
  currency: string;
  perks: string[];
  country: string | null;
  city: string | null;
  status: string;
  hero_image_url: string | null;
  created_at: string;
}

export interface SponsorshipOffer {
  id: string;
  brand_id: string;
  listing_id: string | null;
  event_id: string | null;
  host_id: string;
  brand_owner_id: string;
  amount: number;
  currency: string;
  message: string | null;
  status: string;
  created_at: string;
}

export const useSponsorshipListings = (filters?: { eventType?: string; city?: string }) =>
  useQuery({
    queryKey: ["sponsorship-listings", filters],
    queryFn: async () => {
      let q = supabase.from("sponsorship_listings").select("*").eq("status", "open").order("created_at", { ascending: false });
      if (filters?.eventType) q = q.eq("event_type", filters.eventType);
      if (filters?.city) q = q.ilike("city", `%${filters.city}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data as SponsorshipListing[];
    },
  });

export const useSponsorshipListing = (id?: string) =>
  useQuery({
    queryKey: ["sponsorship-listing", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("sponsorship_listings").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as SponsorshipListing | null;
    },
  });

export const useMyListings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-listings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("sponsorship_listings").select("*").eq("host_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as SponsorshipListing[];
    },
  });
};

export const useCreateListing = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<SponsorshipListing>) => {
      if (!user) throw new Error("Sign in required");
      const { data, error } = await supabase.from("sponsorship_listings").insert({ ...input, host_id: user.id } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sponsorship-listings"] });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
};

export const useMyOffers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-offers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("sponsorship_offers").select("*").or(`brand_owner_id.eq.${user!.id},host_id.eq.${user!.id}`).order("created_at", { ascending: false });
      if (error) throw error;
      return data as SponsorshipOffer[];
    },
  });
};

export const useCreateOffer = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<SponsorshipOffer>) => {
      if (!user) throw new Error("Sign in required");
      const { data, error } = await supabase.from("sponsorship_offers").insert({ ...input, brand_owner_id: user.id } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-offers"] }),
  });
};

export const useUpdateOfferStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "declined" | "withdrawn" }) => {
      const { data, error } = await supabase.from("sponsorship_offers").update({ status }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-offers"] }),
  });
};
