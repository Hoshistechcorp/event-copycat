-- Brands table
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  description TEXT,
  hq_country TEXT,
  hq_city TEXT,
  budget_min NUMERIC NOT NULL DEFAULT 0,
  budget_max NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  target_event_types TEXT[] NOT NULL DEFAULT '{}',
  target_audience TEXT[] NOT NULL DEFAULT '{}',
  preferred_styles TEXT[] NOT NULL DEFAULT '{}',
  preferred_locations TEXT[] NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published brands" ON public.brands FOR SELECT USING (is_published OR owner_user_id = auth.uid());
CREATE POLICY "Owners insert own brand" ON public.brands FOR INSERT TO authenticated WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "Owners update own brand" ON public.brands FOR UPDATE TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY "Owners delete own brand" ON public.brands FOR DELETE TO authenticated USING (owner_user_id = auth.uid());
CREATE TRIGGER trg_brands_updated BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sponsorship listings
CREATE TABLE public.sponsorship_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL,
  event_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  audience_size INTEGER NOT NULL DEFAULT 0,
  demographics JSONB NOT NULL DEFAULT '{}'::jsonb,
  asking_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  perks TEXT[] NOT NULL DEFAULT '{}',
  country TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  hero_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sponsorship_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view open listings" ON public.sponsorship_listings FOR SELECT USING (status = 'open' OR host_id = auth.uid());
CREATE POLICY "Hosts insert own listing" ON public.sponsorship_listings FOR INSERT TO authenticated WITH CHECK (host_id = auth.uid());
CREATE POLICY "Hosts update own listing" ON public.sponsorship_listings FOR UPDATE TO authenticated USING (host_id = auth.uid());
CREATE POLICY "Hosts delete own listing" ON public.sponsorship_listings FOR DELETE TO authenticated USING (host_id = auth.uid());
CREATE TRIGGER trg_listings_updated BEFORE UPDATE ON public.sponsorship_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sponsorship offers
CREATE TABLE public.sponsorship_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL,
  listing_id UUID,
  event_id UUID,
  host_id UUID NOT NULL,
  brand_owner_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sponsorship_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brand owner views own offers" ON public.sponsorship_offers FOR SELECT USING (brand_owner_id = auth.uid() OR host_id = auth.uid());
CREATE POLICY "Brand owner creates offers" ON public.sponsorship_offers FOR INSERT TO authenticated WITH CHECK (brand_owner_id = auth.uid());
CREATE POLICY "Brand owner updates own offers" ON public.sponsorship_offers FOR UPDATE TO authenticated USING (brand_owner_id = auth.uid() OR host_id = auth.uid());
CREATE TRIGGER trg_offers_updated BEFORE UPDATE ON public.sponsorship_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();