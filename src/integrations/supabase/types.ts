export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      aura_product_links: {
        Row: {
          created_at: string
          id: string
          linked_at: string
          pinned: boolean
          product_id: string
          sort_index: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_at?: string
          pinned?: boolean
          product_id: string
          sort_index?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_at?: string
          pinned?: boolean
          product_id?: string
          sort_index?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string
          id: string
          is_default: boolean
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          created_at?: string
          id?: string
          is_default?: boolean
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          is_default?: boolean
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          currency: string
          deposit_amount: number
          event_date: string | null
          event_id: string | null
          id: string
          notes: string | null
          package_id: string | null
          requester_user_id: string
          status: string
          total_amount: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          deposit_amount?: number
          event_date?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          package_id?: string | null
          requester_user_id: string
          status?: string
          total_amount?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          deposit_amount?: number
          event_date?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          package_id?: string | null
          requester_user_id?: string
          status?: string
          total_amount?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "event_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          budget_max: number
          budget_min: number
          created_at: string
          currency: string
          description: string | null
          hq_city: string | null
          hq_country: string | null
          id: string
          industry: string | null
          is_published: boolean
          logo_url: string | null
          name: string
          owner_user_id: string
          preferred_locations: string[]
          preferred_styles: string[]
          target_audience: string[]
          target_event_types: string[]
          updated_at: string
          website: string | null
        }
        Insert: {
          budget_max?: number
          budget_min?: number
          created_at?: string
          currency?: string
          description?: string | null
          hq_city?: string | null
          hq_country?: string | null
          id?: string
          industry?: string | null
          is_published?: boolean
          logo_url?: string | null
          name: string
          owner_user_id: string
          preferred_locations?: string[]
          preferred_styles?: string[]
          target_audience?: string[]
          target_event_types?: string[]
          updated_at?: string
          website?: string | null
        }
        Update: {
          budget_max?: number
          budget_min?: number
          created_at?: string
          currency?: string
          description?: string | null
          hq_city?: string | null
          hq_country?: string | null
          id?: string
          industry?: string | null
          is_published?: boolean
          logo_url?: string | null
          name?: string
          owner_user_id?: string
          preferred_locations?: string[]
          preferred_styles?: string[]
          target_audience?: string[]
          target_event_types?: string[]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      event_ideas: {
        Row: {
          audience_type: string | null
          city: string | null
          concept: string | null
          country: string | null
          created_at: string
          currency: string
          est_attendance: number | null
          est_ticket_price: number | null
          hero_image_url: string | null
          id: string
          tags: string[]
          title: string
          trend_score: number
        }
        Insert: {
          audience_type?: string | null
          city?: string | null
          concept?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          est_attendance?: number | null
          est_ticket_price?: number | null
          hero_image_url?: string | null
          id?: string
          tags?: string[]
          title: string
          trend_score?: number
        }
        Update: {
          audience_type?: string | null
          city?: string | null
          concept?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          est_attendance?: number | null
          est_ticket_price?: number | null
          hero_image_url?: string | null
          id?: string
          tags?: string[]
          title?: string
          trend_score?: number
        }
        Relationships: []
      }
      event_invites: {
        Row: {
          created_at: string
          email: string
          event_id: string
          id: string
          invite_token: string
          name: string | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          event_id: string
          id?: string
          invite_token?: string
          name?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string
          id?: string
          invite_token?: string
          name?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_packages: {
        Row: {
          base_price: number
          category: string
          created_at: string
          currency: string
          description: string | null
          gallery_urls: string[]
          guest_capacity: number
          hero_image_url: string | null
          id: string
          included_vendor_categories: string[]
          is_published: boolean
          slug: string
          timeline_json: Json
          title: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          gallery_urls?: string[]
          guest_capacity?: number
          hero_image_url?: string | null
          id?: string
          included_vendor_categories?: string[]
          is_published?: boolean
          slug: string
          timeline_json?: Json
          title: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          gallery_urls?: string[]
          guest_capacity?: number
          hero_image_url?: string | null
          id?: string
          included_vendor_categories?: string[]
          is_published?: boolean
          slug?: string
          timeline_json?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_vendor_assignments: {
        Row: {
          category_slug: string | null
          created_at: string
          duration_minutes: number | null
          event_id: string
          id: string
          notes: string | null
          scheduled_at: string | null
          sort_order: number
          status: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          category_slug?: string | null
          created_at?: string
          duration_minutes?: number | null
          event_id: string
          id?: string
          notes?: string | null
          scheduled_at?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          category_slug?: string | null
          created_at?: string
          duration_minutes?: number | null
          event_id?: string
          id?: string
          notes?: string | null
          scheduled_at?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_vendor_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_vendor_assignments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          created_at: string
          currency: string
          date: string
          description: string | null
          end_date: string | null
          event_format: string
          host_id: string
          id: string
          image_url: string | null
          is_paid: boolean
          location_reveal: string
          online_url: string | null
          open_to_sponsorship: boolean
          qr_secret: string
          requires_rsvp: boolean
          reveal_hours_before: number
          slug: string | null
          status: string
          title: string
          updated_at: string
          venue: string | null
          venue_address: string | null
          visibility: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string
          date: string
          description?: string | null
          end_date?: string | null
          event_format?: string
          host_id: string
          id?: string
          image_url?: string | null
          is_paid?: boolean
          location_reveal?: string
          online_url?: string | null
          open_to_sponsorship?: boolean
          qr_secret?: string
          requires_rsvp?: boolean
          reveal_hours_before?: number
          slug?: string | null
          status?: string
          title: string
          updated_at?: string
          venue?: string | null
          venue_address?: string | null
          visibility?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          end_date?: string | null
          event_format?: string
          host_id?: string
          id?: string
          image_url?: string | null
          is_paid?: boolean
          location_reveal?: string
          online_url?: string | null
          open_to_sponsorship?: boolean
          qr_secret?: string
          requires_rsvp?: boolean
          reveal_hours_before?: number
          slug?: string | null
          status?: string
          title?: string
          updated_at?: string
          venue?: string | null
          venue_address?: string | null
          visibility?: string
        }
        Relationships: []
      }
      performers: {
        Row: {
          avatar_url: string | null
          created_at: string
          event_id: string
          id: string
          name: string
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          event_id: string
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          event_id?: string
          id?: string
          name?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          withdrawal_pin: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          withdrawal_pin?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          withdrawal_pin?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          event_id: string
          expires_at: string | null
          id: string
          max_uses: number | null
          updated_at: string
          used_count: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type?: string
          event_id: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          updated_at?: string
          used_count?: number
          value?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          event_id?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          updated_at?: string
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      promotions: {
        Row: {
          amount_paid: number
          created_at: string
          end_date: string
          event_id: string
          host_id: string
          id: string
          placement: string
          start_date: string
          status: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          end_date: string
          event_id: string
          host_id: string
          id?: string
          placement?: string
          start_date?: string
          status?: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          end_date?: string
          event_id?: string
          host_id?: string
          id?: string
          placement?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvps: {
        Row: {
          created_at: string
          email: string | null
          event_id: string
          id: string
          invite_id: string | null
          name: string | null
          plus_ones: number
          responded_at: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_id: string
          id?: string
          invite_id?: string | null
          name?: string | null
          plus_ones?: number
          responded_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_id?: string
          id?: string
          invite_id?: string | null
          name?: string | null
          plus_ones?: number
          responded_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sponsorship_listings: {
        Row: {
          asking_amount: number
          audience_size: number
          city: string | null
          country: string | null
          created_at: string
          currency: string
          demographics: Json
          description: string | null
          event_id: string | null
          event_type: string | null
          hero_image_url: string | null
          host_id: string
          id: string
          perks: string[]
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          asking_amount?: number
          audience_size?: number
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          demographics?: Json
          description?: string | null
          event_id?: string | null
          event_type?: string | null
          hero_image_url?: string | null
          host_id: string
          id?: string
          perks?: string[]
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          asking_amount?: number
          audience_size?: number
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          demographics?: Json
          description?: string | null
          event_id?: string | null
          event_type?: string | null
          hero_image_url?: string | null
          host_id?: string
          id?: string
          perks?: string[]
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsorship_offers: {
        Row: {
          amount: number
          brand_id: string
          brand_owner_id: string
          created_at: string
          currency: string
          event_id: string | null
          host_id: string
          id: string
          listing_id: string | null
          message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          brand_id: string
          brand_owner_id: string
          created_at?: string
          currency?: string
          event_id?: string | null
          host_id: string
          id?: string
          listing_id?: string | null
          message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          brand_id?: string
          brand_owner_id?: string
          created_at?: string
          currency?: string
          event_id?: string | null
          host_id?: string
          id?: string
          listing_id?: string | null
          message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_purchases: {
        Row: {
          buyer_email: string
          buyer_name: string | null
          buyer_user_id: string | null
          checked_in_at: string | null
          created_at: string
          discount_amount: number
          event_id: string
          id: string
          promo_code_id: string | null
          qr_token: string
          quantity: number
          status: string
          ticket_tier_id: string
          total_amount: number
          unit_price: number
        }
        Insert: {
          buyer_email: string
          buyer_name?: string | null
          buyer_user_id?: string | null
          checked_in_at?: string | null
          created_at?: string
          discount_amount?: number
          event_id: string
          id?: string
          promo_code_id?: string | null
          qr_token?: string
          quantity?: number
          status?: string
          ticket_tier_id: string
          total_amount: number
          unit_price: number
        }
        Update: {
          buyer_email?: string
          buyer_name?: string | null
          buyer_user_id?: string | null
          checked_in_at?: string | null
          created_at?: string
          discount_amount?: number
          event_id?: string
          id?: string
          promo_code_id?: string | null
          qr_token?: string
          quantity?: number
          status?: string
          ticket_tier_id?: string
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_purchases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_purchases_ticket_tier_id_fkey"
            columns: ["ticket_tier_id"]
            isOneToOne: false
            referencedRelation: "ticket_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_tiers: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          name: string
          price: number
          quantity: number
          test_fee_percent: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          name: string
          price?: number
          quantity?: number
          test_fee_percent?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          name?: string
          price?: number
          quantity?: number
          test_fee_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          status: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          status?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          status?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_availability_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_categories: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      vendors: {
        Row: {
          avatar_url: string | null
          base_price: number
          bio: string | null
          business_name: string
          category_id: string
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          currency: string
          email: string | null
          id: string
          instagram_url: string | null
          is_published: boolean
          is_verified: boolean
          owner_user_id: string | null
          phone: string | null
          portfolio_urls: string[]
          rating: number
          review_count: number
          tagline: string | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          base_price?: number
          bio?: string | null
          business_name: string
          category_id: string
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          instagram_url?: string | null
          is_published?: boolean
          is_verified?: boolean
          owner_user_id?: string | null
          phone?: string | null
          portfolio_urls?: string[]
          rating?: number
          review_count?: number
          tagline?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          base_price?: number
          bio?: string | null
          business_name?: string
          category_id?: string
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          instagram_url?: string | null
          is_published?: boolean
          is_verified?: boolean
          owner_user_id?: string | null
          phone?: string | null
          portfolio_urls?: string[]
          rating?: number
          review_count?: number
          tagline?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vendor_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          bank_account_id: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_invite_by_token: {
        Args: { _token: string }
        Returns: {
          email: string
          event_date: string
          event_format: string
          event_id: string
          event_title: string
          event_venue: string
          id: string
          name: string
          status: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
