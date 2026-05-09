import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Brand {
  id: string;
  owner_user_id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  industry: string | null;
  description: string | null;
  hq_country: string | null;
  hq_city: string | null;
  budget_min: number;
  budget_max: number;
  currency: string;
  target_event_types: string[];
  target_audience: string[];
  preferred_styles: string[];
  preferred_locations: string[];
  is_published: boolean;
  created_at: string;
}

export const useBrands = () =>
  useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brands").select("*").eq("is_published", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Brand[];
    },
  });

export const useBrand = (id?: string) =>
  useQuery({
    queryKey: ["brand", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("brands").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as Brand | null;
    },
  });

export const useMyBrand = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-brand", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("brands").select("*").eq("owner_user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data as Brand | null;
    },
  });
};

export const useUpsertBrand = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Brand> & { id?: string }) => {
      if (!user) throw new Error("Sign in required");
      const payload = { ...input, owner_user_id: user.id };
      if (input.id) {
        const { data, error } = await supabase.from("brands").update(payload).eq("id", input.id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("brands").insert(payload as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      qc.invalidateQueries({ queryKey: ["my-brand"] });
    },
  });
};
