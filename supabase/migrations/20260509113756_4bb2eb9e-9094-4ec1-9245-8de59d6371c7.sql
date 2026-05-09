
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ADD COLUMN IF NOT EXISTS twitter_url text;

CREATE TABLE IF NOT EXISTS public.event_vendor_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  category_slug text,
  scheduled_at timestamptz,
  duration_minutes integer DEFAULT 60,
  notes text,
  status text NOT NULL DEFAULT 'planned',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_vendor_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts view own event assignments"
ON public.event_vendor_assignments FOR SELECT
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.host_id = auth.uid()));

CREATE POLICY "Hosts insert own event assignments"
ON public.event_vendor_assignments FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.host_id = auth.uid()));

CREATE POLICY "Hosts update own event assignments"
ON public.event_vendor_assignments FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.host_id = auth.uid()));

CREATE POLICY "Hosts delete own event assignments"
ON public.event_vendor_assignments FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.host_id = auth.uid()));

CREATE TRIGGER trg_eva_updated
BEFORE UPDATE ON public.event_vendor_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_eva_event ON public.event_vendor_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_eva_vendor ON public.event_vendor_assignments(vendor_id);
