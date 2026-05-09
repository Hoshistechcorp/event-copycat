-- Bloov Service / Bloov Create schema

CREATE TABLE public.vendor_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon_name text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view vendor categories" ON public.vendor_categories FOR SELECT USING (true);

CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid,
  category_id uuid NOT NULL REFERENCES public.vendor_categories(id) ON DELETE RESTRICT,
  business_name text NOT NULL,
  tagline text,
  bio text,
  city text,
  country text,
  base_price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  avatar_url text,
  cover_url text,
  portfolio_urls text[] NOT NULL DEFAULT '{}',
  rating numeric NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  is_verified boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published vendors" ON public.vendors FOR SELECT USING (is_published = true OR owner_user_id = auth.uid());
CREATE POLICY "Owners can insert own vendor" ON public.vendors FOR INSERT TO authenticated WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "Owners can update own vendor" ON public.vendors FOR UPDATE TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY "Owners can delete own vendor" ON public.vendors FOR DELETE TO authenticated USING (owner_user_id = auth.uid());
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.vendor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, date)
);
ALTER TABLE public.vendor_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view availability for published vendors" ON public.vendor_availability FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND (v.is_published OR v.owner_user_id = auth.uid())));
CREATE POLICY "Owners manage availability" ON public.vendor_availability FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.owner_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.owner_user_id = auth.uid()));

CREATE TABLE public.event_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category text NOT NULL DEFAULT 'general',
  base_price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  guest_capacity integer NOT NULL DEFAULT 100,
  hero_image_url text,
  gallery_urls text[] NOT NULL DEFAULT '{}',
  included_vendor_categories text[] NOT NULL DEFAULT '{}',
  timeline_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.event_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published packages" ON public.event_packages FOR SELECT USING (is_published = true);
CREATE TRIGGER update_event_packages_updated_at BEFORE UPDATE ON public.event_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id uuid NOT NULL,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  event_id uuid,
  package_id uuid REFERENCES public.event_packages(id) ON DELETE SET NULL,
  event_date date,
  status text NOT NULL DEFAULT 'requested',
  total_amount numeric NOT NULL DEFAULT 0,
  deposit_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Requesters view own bookings" ON public.bookings FOR SELECT USING (requester_user_id = auth.uid());
CREATE POLICY "Vendors view bookings for own vendor" ON public.bookings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.owner_user_id = auth.uid()));
CREATE POLICY "Requesters create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (requester_user_id = auth.uid());
CREATE POLICY "Requesters update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (requester_user_id = auth.uid());
CREATE POLICY "Vendors update bookings for own vendor" ON public.bookings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.owner_user_id = auth.uid()));
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.event_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  concept text,
  city text,
  country text,
  audience_type text,
  est_attendance integer,
  est_ticket_price numeric,
  currency text NOT NULL DEFAULT 'NGN',
  trend_score integer NOT NULL DEFAULT 0,
  hero_image_url text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.event_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view event ideas" ON public.event_ideas FOR SELECT USING (true);

-- Seed vendor categories
INSERT INTO public.vendor_categories (slug, name, description, icon_name, sort_order) VALUES
  ('venues', 'Venues', 'Halls, rooftops, outdoor spaces', 'Building2', 1),
  ('photographers', 'Photographers', 'Capture every moment', 'Camera', 2),
  ('videographers', 'Videographers', 'Cinematic event films', 'Video', 3),
  ('djs', 'DJs', 'Set the vibe', 'Disc3', 4),
  ('mcs', 'MCs', 'Hosts and hype', 'Mic2', 5),
  ('caterers', 'Caterers', 'Full menu services', 'UtensilsCrossed', 6),
  ('decorators', 'Decorators', 'Themes and styling', 'Sparkles', 7),
  ('florists', 'Florists', 'Floral installations', 'Flower2', 8),
  ('security', 'Security', 'Bouncers and protection', 'Shield', 9),
  ('bartenders', 'Bartenders', 'Mixology and bar service', 'GlassWater', 10),
  ('transportation', 'Transportation', 'Logistics for guests', 'Bus', 11),
  ('makeup', 'Makeup Artists', 'Glam and beauty', 'Palette', 12),
  ('planners', 'Planners', 'Coordinators and planners', 'ClipboardList', 13),
  ('ushers', 'Ushers', 'Guest reception', 'Users', 14),
  ('lighting', 'Lighting', 'Stage and ambient lighting', 'Lightbulb', 15),
  ('traditional', 'Traditional Vendors', 'Alaga, Aso-Ebi, beads & more', 'Crown', 16);

-- Seed vendors
INSERT INTO public.vendors (category_id, business_name, tagline, bio, city, country, base_price, currency, avatar_url, cover_url, rating, review_count, is_verified)
SELECT c.id, v.business_name, v.tagline, v.bio, v.city, v.country, v.base_price, 'NGN', v.avatar_url, v.cover_url, v.rating, v.review_count, v.is_verified
FROM (VALUES
  ('venues', 'Skyline Rooftop Lagos', 'Panoramic VI rooftop venue', '300-capacity rooftop with skyline views.', 'Lagos', 'Nigeria', 800000, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200', 4.8, 127, true),
  ('photographers', 'Lens of Lagos', 'Editorial event photography', 'Award-winning lifestyle and event photography.', 'Lagos', 'Nigeria', 250000, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200', 4.9, 214, true),
  ('djs', 'DJ Aftermath', 'Afrobeats & house master', 'Toured 12 cities. The party doesn''t start without him.', 'Abuja', 'Nigeria', 400000, 'https://images.unsplash.com/photo-1571266028243-d220bc562a25?w=400', 'https://images.unsplash.com/photo-1571266028243-d220bc562a25?w=1200', 4.9, 188, true),
  ('mcs', 'MC Spice', 'Bilingual hype host', 'High-energy MC for weddings, concerts, corporate.', 'Lagos', 'Nigeria', 200000, 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=400', 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=1200', 4.7, 96, false),
  ('caterers', 'Buka & Co.', 'Modern Nigerian catering', 'Jollof, suya, small chops elevated.', 'Lagos', 'Nigeria', 1200000, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200', 4.8, 142, true),
  ('decorators', 'Velvet Drape Studio', 'Luxury event decor', 'Custom installations and themed builds.', 'Lagos', 'Nigeria', 950000, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200', 4.9, 167, true),
  ('florists', 'Bloom House', 'Floral installations & bouquets', 'Lush, romantic, modern florals.', 'Lagos', 'Nigeria', 350000, 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400', 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1200', 4.7, 78, false),
  ('makeup', 'Glow by Tola', 'Bridal & editorial makeup', 'Soft glam to bold editorial looks.', 'Lagos', 'Nigeria', 150000, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200', 5.0, 312, true),
  ('lighting', 'Lumen Productions', 'Stage & ambient lighting', 'Concert-grade lighting for any size event.', 'Abuja', 'Nigeria', 600000, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200', 4.6, 54, false),
  ('security', 'Sentinel Event Security', 'Trained event security', 'Discrete, professional, scalable.', 'Lagos', 'Nigeria', 300000, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200', 4.5, 41, false),
  ('planners', 'Atelier Soirée', 'Full-service planning', 'Weddings, corporate, milestones.', 'Lagos', 'Nigeria', 1500000, 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200', 4.9, 203, true),
  ('traditional', 'Iya Alaga Premium', 'Alaga Iduro & Ijoko', 'Traditional ceremony icons.', 'Ibadan', 'Nigeria', 250000, 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200', 4.9, 156, true)
) AS v(cat_slug, business_name, tagline, bio, city, country, base_price, avatar_url, cover_url, rating, review_count, is_verified)
JOIN public.vendor_categories c ON c.slug = v.cat_slug;

-- Seed packages
INSERT INTO public.event_packages (title, slug, description, category, base_price, currency, guest_capacity, hero_image_url, included_vendor_categories) VALUES
  ('Luxury Wedding', 'luxury-wedding', 'Complete white-glove wedding production for up to 300 guests.', 'wedding', 12000000, 'NGN', 300, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200', ARRAY['venues','planners','caterers','decorators','florists','photographers','videographers','djs','mcs','makeup','lighting','security']),
  ('Nigerian Traditional Wedding', 'traditional-wedding', 'Authentic traditional ceremony with Alaga, Aso-Ebi, and full styling.', 'wedding', 8500000, 'NGN', 250, 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200', ARRAY['traditional','planners','caterers','decorators','photographers','mcs','makeup']),
  ('Silent Disco', 'silent-disco', 'Wireless headphone party experience, three audio channels.', 'nightlife', 3500000, 'NGN', 500, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200', ARRAY['venues','djs','lighting','security','bartenders']),
  ('Creator Party', 'creator-party', 'Influencer-ready brand activation with content moments.', 'creator', 4500000, 'NGN', 150, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200', ARRAY['venues','photographers','videographers','djs','decorators','bartenders']),
  ('Corporate Mixer', 'corporate-mixer', 'Professional networking event with bar and catering.', 'corporate', 3000000, 'NGN', 200, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200', ARRAY['venues','caterers','bartenders','mcs','photographers','security']),
  ('Rooftop Experience', 'rooftop-experience', 'Sunset-to-night rooftop party with curated lineup.', 'nightlife', 5000000, 'NGN', 250, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200', ARRAY['venues','djs','bartenders','lighting','decorators','security']),
  ('Festival Package', 'festival-package', 'Multi-stage outdoor festival production.', 'festival', 25000000, 'NGN', 2000, 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200', ARRAY['venues','planners','djs','mcs','lighting','security','caterers','bartenders','photographers','videographers']);

-- Seed event ideas
INSERT INTO public.event_ideas (title, concept, city, country, audience_type, est_attendance, est_ticket_price, currency, trend_score, hero_image_url, tags) VALUES
  ('Afro House Sunset', 'Rooftop Afro house party at golden hour with live percussion.', 'Lagos', 'Nigeria', 'Young professionals', 300, 15000, 'NGN', 92, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200', ARRAY['nightlife','rooftop','music']),
  ('Silent Rave Nights', 'Three-channel silent disco in an industrial warehouse.', 'Abuja', 'Nigeria', 'Gen-Z', 500, 10000, 'NGN', 88, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200', ARRAY['nightlife','silent-disco']),
  ('Creator Brunch Club', 'Monthly creator-only brunch with brand activations.', 'Lagos', 'Nigeria', 'Creators', 80, 25000, 'NGN', 85, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200', ARRAY['creator','brunch','networking']),
  ('Lagos Food Crawl', 'Curated tasting tour across 5 Lagos restaurants.', 'Lagos', 'Nigeria', 'Foodies', 60, 35000, 'NGN', 78, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200', ARRAY['food','tourism']),
  ('Afrobeats Festival', 'Open-air festival with top Nigerian acts.', 'Lagos', 'Nigeria', 'Mass market', 5000, 20000, 'NGN', 96, 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200', ARRAY['festival','music']),
  ('Wellness Retreat Day', 'Yoga, sound bath, and wellness market.', 'Abuja', 'Nigeria', 'Wellness', 120, 18000, 'NGN', 72, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200', ARRAY['wellness','daytime']),
  ('Sports Viewing Lounge', 'Premium UCL viewing with chef-curated menu.', 'Lagos', 'Nigeria', 'Sports fans', 200, 12000, 'NGN', 80, 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=1200', ARRAY['sports','viewing']),
  ('Tech Founders Mixer', 'Investor + founder networking with fireside chat.', 'Lagos', 'Nigeria', 'Tech', 150, 30000, 'NGN', 83, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200', ARRAY['tech','networking']);
