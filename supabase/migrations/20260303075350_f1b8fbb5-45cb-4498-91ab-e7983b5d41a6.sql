
-- Create ticket_purchases table to track ticket sales
CREATE TABLE public.ticket_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_tier_id uuid NOT NULL REFERENCES public.ticket_tiers(id) ON DELETE CASCADE,
  buyer_email text NOT NULL,
  buyer_name text,
  buyer_user_id uuid,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;

-- Hosts can view purchases for their own events
CREATE POLICY "Hosts can view purchases for own events"
ON public.ticket_purchases
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = ticket_purchases.event_id
    AND events.host_id = auth.uid()
  )
);

-- Buyers can view their own purchases
CREATE POLICY "Buyers can view own purchases"
ON public.ticket_purchases
FOR SELECT
USING (buyer_user_id = auth.uid());

-- Authenticated users can create purchases
CREATE POLICY "Authenticated users can create purchases"
ON public.ticket_purchases
FOR INSERT
WITH CHECK (true);

-- Enable realtime for ticket_purchases so hosts see live sales
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_purchases;
