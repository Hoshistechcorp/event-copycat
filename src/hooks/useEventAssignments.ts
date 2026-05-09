import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EventAssignment {
  id: string;
  event_id: string;
  vendor_id: string | null;
  category_slug: string | null;
  scheduled_at: string | null;
  duration_minutes: number;
  notes: string | null;
  status: string;
  sort_order: number;
}

export const useEventAssignments = (eventId?: string) =>
  useQuery({
    queryKey: ["event-assignments", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_vendor_assignments")
        .select("*, vendors(business_name, avatar_url, base_price, currency)")
        .eq("event_id", eventId!)
        .order("sort_order");
      if (error) throw error;
      return data as (EventAssignment & {
        vendors?: { business_name: string; avatar_url: string | null; base_price: number; currency: string } | null;
      })[];
    },
  });

export const useAddAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      event_id: string;
      vendor_id?: string | null;
      category_slug?: string | null;
      scheduled_at?: string | null;
      notes?: string | null;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase
        .from("event_vendor_assignments")
        .insert({
          event_id: input.event_id,
          vendor_id: input.vendor_id ?? null,
          category_slug: input.category_slug ?? null,
          scheduled_at: input.scheduled_at ?? null,
          notes: input.notes ?? null,
          sort_order: input.sort_order ?? 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["event-assignments", vars.event_id] }),
  });
};

export const useUpdateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      scheduled_at?: string | null;
      duration_minutes?: number;
      notes?: string | null;
      status?: string;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase
        .from("event_vendor_assignments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-assignments"] }),
  });
};

export const useRemoveAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_vendor_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-assignments"] }),
  });
};
