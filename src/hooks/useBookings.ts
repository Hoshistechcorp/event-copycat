import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Booking {
  id: string;
  vendor_id: string | null;
  package_id: string | null;
  event_id: string | null;
  event_date: string | null;
  status: string;
  total_amount: number;
  deposit_amount: number;
  currency: string;
  notes: string | null;
  created_at: string;
  requester_user_id?: string;
}

type BookingWithJoins = Booking & {
  vendors?: { business_name: string; avatar_url: string | null } | null;
  event_packages?: { title: string; hero_image_url: string | null; base_price: number } | null;
};

export const useMyBookings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vendors(business_name, avatar_url), event_packages(title, hero_image_url, base_price)")
        .eq("requester_user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookingWithJoins[];
    },
  });
};

// Bookings *received* by the current user as a vendor owner.
export const useIncomingBookings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["incoming-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: ownedVendors } = await supabase
        .from("vendors")
        .select("id")
        .eq("owner_user_id", user!.id);
      const ids = (ownedVendors ?? []).map((v) => v.id);
      if (ids.length === 0) return [] as BookingWithJoins[];
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vendors(business_name, avatar_url), event_packages(title, hero_image_url, base_price)")
        .in("vendor_id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookingWithJoins[];
    },
  });
};

export interface CreateBookingInput {
  vendor_id?: string;
  package_id?: string;
  event_date?: string | null;
  total_amount: number;
  deposit_amount: number;
  currency?: string;
  notes?: string | null;
}

export const useCreateBooking = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      if (!user) throw new Error("You must be signed in to book.");
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          requester_user_id: user.id,
          vendor_id: input.vendor_id ?? null,
          package_id: input.package_id ?? null,
          event_date: input.event_date ?? null,
          total_amount: input.total_amount,
          deposit_amount: input.deposit_amount,
          currency: input.currency ?? "NGN",
          notes: input.notes ?? null,
          status: "requested",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      qc.invalidateQueries({ queryKey: ["incoming-bookings"] });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "confirmed" | "declined" | "completed" | "cancelled" }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incoming-bookings"] });
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
};
