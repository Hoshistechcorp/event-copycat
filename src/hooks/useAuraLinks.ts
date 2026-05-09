import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AuraLink {
  id: string;
  user_id: string;
  product_id: string;
  pinned: boolean;
  sort_index: number;
  linked_at: string;
}

export const useAuraLinks = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["aura-links", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aura_product_links")
        .select("*")
        .eq("user_id", user!.id)
        .order("sort_index", { ascending: true });
      if (error) throw error;
      return data as AuraLink[];
    },
  });

  const link = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Sign in required");
      const sort = (query.data?.length ?? 0) + 1;
      const { data, error } = await supabase
        .from("aura_product_links")
        .insert({ user_id: user.id, product_id: productId, sort_index: sort })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aura-links"] }),
  });

  const unlink = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) return;
      const { error } = await supabase.from("aura_product_links").delete().eq("user_id", user.id).eq("product_id", productId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aura-links"] }),
  });

  const togglePin = useMutation({
    mutationFn: async ({ productId, pinned }: { productId: string; pinned: boolean }) => {
      if (!user) return;
      const { error } = await supabase.from("aura_product_links").update({ pinned }).eq("user_id", user.id).eq("product_id", productId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aura-links"] }),
  });

  const reorder = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      if (!user) return;
      await Promise.all(
        orderedIds.map((pid, i) =>
          supabase.from("aura_product_links").update({ sort_index: i }).eq("user_id", user.id).eq("product_id", pid)
        )
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aura-links"] }),
  });

  const linkedIds = new Set((query.data ?? []).map((l) => l.product_id));
  const isLinked = (productId: string) => linkedIds.has(productId);
  const pinnedIds = (query.data ?? []).filter((l) => l.pinned).map((l) => l.product_id);

  return { ...query, link, unlink, togglePin, reorder, isLinked, pinnedIds };
};
