
-- Create promotions table for paid event promotion
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  host_id uuid NOT NULL,
  placement text NOT NULL DEFAULT 'banner', -- 'banner', 'hero', 'both'
  status text NOT NULL DEFAULT 'active', -- 'active', 'expired', 'pending'
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  amount_paid numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Hosts can view their own promotions
CREATE POLICY "Hosts can view own promotions"
ON public.promotions
FOR SELECT
TO authenticated
USING (auth.uid() = host_id);

-- Hosts can create promotions for their own events
CREATE POLICY "Hosts can create promotions"
ON public.promotions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = host_id AND
  EXISTS (SELECT 1 FROM public.events WHERE events.id = event_id AND events.host_id = auth.uid())
);

-- Anyone can view active promotions (for displaying on public pages)
CREATE POLICY "Anyone can view active promotions"
ON public.promotions
FOR SELECT
USING (status = 'active' AND end_date > now());
