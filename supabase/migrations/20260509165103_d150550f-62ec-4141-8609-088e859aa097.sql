
-- ============ EVENTS additions ============
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS event_format TEXT NOT NULL DEFAULT 'in_person',
  ADD COLUMN IF NOT EXISTS online_url TEXT,
  ADD COLUMN IF NOT EXISTS location_reveal TEXT NOT NULL DEFAULT 'always',
  ADD COLUMN IF NOT EXISTS reveal_hours_before INTEGER NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS requires_rsvp BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS qr_secret UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_visibility_check;
ALTER TABLE public.events ADD CONSTRAINT events_visibility_check
  CHECK (visibility IN ('public','private','unlisted'));

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_format_check;
ALTER TABLE public.events ADD CONSTRAINT events_format_check
  CHECK (event_format IN ('in_person','online','hybrid'));

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_reveal_check;
ALTER TABLE public.events ADD CONSTRAINT events_reveal_check
  CHECK (location_reveal IN ('always','on_rsvp','hours_before'));

-- venue should be nullable for online-only events
ALTER TABLE public.events ALTER COLUMN venue DROP NOT NULL;

-- Allow viewing private/unlisted events by direct id (not in feeds, but accessible if you have the link)
DROP POLICY IF EXISTS "Anyone can view unlisted events by id" ON public.events;
CREATE POLICY "Anyone can view unlisted events by id"
ON public.events FOR SELECT
USING (status = 'published' AND visibility IN ('public','unlisted','private'));
-- Note: feed pages should filter to visibility='public' in queries.

-- ============ TICKET_PURCHASES additions ============
ALTER TABLE public.ticket_purchases
  ADD COLUMN IF NOT EXISTS promo_code_id UUID,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qr_token UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

-- ============ PROMO_CODES ============
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percent',
  value NUMERIC NOT NULL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT promo_codes_type_check CHECK (discount_type IN ('percent','flat')),
  CONSTRAINT promo_codes_event_code_unique UNIQUE (event_id, code)
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hosts manage own promo codes" ON public.promo_codes;
CREATE POLICY "Hosts manage own promo codes"
ON public.promo_codes FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = promo_codes.event_id AND e.host_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = promo_codes.event_id AND e.host_id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can view active promo codes for published events" ON public.promo_codes;
CREATE POLICY "Anyone can view active promo codes for published events"
ON public.promo_codes FOR SELECT
USING (
  active = true
  AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = promo_codes.event_id AND e.status = 'published')
);

CREATE TRIGGER promo_codes_updated_at BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ EVENT_INVITES ============
CREATE TABLE IF NOT EXISTS public.event_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  invite_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT event_invites_status_check CHECK (status IN ('pending','accepted','declined')),
  CONSTRAINT event_invites_event_email_unique UNIQUE (event_id, email)
);

ALTER TABLE public.event_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hosts manage own invites" ON public.event_invites;
CREATE POLICY "Hosts manage own invites"
ON public.event_invites FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_invites.event_id AND e.host_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_invites.event_id AND e.host_id = auth.uid()));

-- Public lookup by token will be done via security definer function (not direct select)
CREATE OR REPLACE FUNCTION public.get_invite_by_token(_token UUID)
RETURNS TABLE (
  id UUID,
  event_id UUID,
  email TEXT,
  name TEXT,
  status TEXT,
  event_title TEXT,
  event_date TIMESTAMPTZ,
  event_venue TEXT,
  event_format TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.event_id, i.email, i.name, i.status,
         e.title, e.date, e.venue, e.event_format
  FROM public.event_invites i
  JOIN public.events e ON e.id = i.event_id
  WHERE i.invite_token = _token
  LIMIT 1;
$$;

CREATE TRIGGER event_invites_updated_at BEFORE UPDATE ON public.event_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ RSVPS ============
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID,
  email TEXT,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'going',
  plus_ones INTEGER NOT NULL DEFAULT 0,
  invite_id UUID,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rsvps_status_check CHECK (status IN ('going','maybe','not_going')),
  CONSTRAINT rsvps_identity_check CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hosts view RSVPs for own events" ON public.rsvps;
CREATE POLICY "Hosts view RSVPs for own events"
ON public.rsvps FOR SELECT
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = rsvps.event_id AND e.host_id = auth.uid()));

DROP POLICY IF EXISTS "Users view own RSVPs" ON public.rsvps;
CREATE POLICY "Users view own RSVPs"
ON public.rsvps FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users create own RSVP" ON public.rsvps;
CREATE POLICY "Authenticated users create own RSVP"
ON public.rsvps FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can RSVP via invite" ON public.rsvps;
CREATE POLICY "Anyone can RSVP via invite"
ON public.rsvps FOR INSERT
WITH CHECK (
  invite_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.event_invites i WHERE i.id = rsvps.invite_id AND i.event_id = rsvps.event_id)
);

DROP POLICY IF EXISTS "Users update own RSVP" ON public.rsvps;
CREATE POLICY "Users update own RSVP"
ON public.rsvps FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER rsvps_updated_at BEFORE UPDATE ON public.rsvps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS rsvps_event_id_idx ON public.rsvps(event_id);
CREATE INDEX IF NOT EXISTS event_invites_event_id_idx ON public.event_invites(event_id);
CREATE INDEX IF NOT EXISTS promo_codes_event_id_idx ON public.promo_codes(event_id);
CREATE INDEX IF NOT EXISTS ticket_purchases_qr_token_idx ON public.ticket_purchases(qr_token);
