-- Allow event hosts to mark tickets as checked in
CREATE POLICY "Hosts can update purchases for own events"
ON public.ticket_purchases
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.events e
  WHERE e.id = ticket_purchases.event_id AND e.host_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.events e
  WHERE e.id = ticket_purchases.event_id AND e.host_id = auth.uid()
));

-- Allow hosts to update RSVP statuses (e.g., mark attendance) for their events
CREATE POLICY "Hosts update RSVPs for own events"
ON public.rsvps
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.events e
  WHERE e.id = rsvps.event_id AND e.host_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.events e
  WHERE e.id = rsvps.event_id AND e.host_id = auth.uid()
));