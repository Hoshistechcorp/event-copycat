
-- Tighten the insert policy to require authentication
DROP POLICY "Authenticated users can create purchases" ON public.ticket_purchases;
CREATE POLICY "Authenticated users can create purchases"
ON public.ticket_purchases
FOR INSERT
TO authenticated
WITH CHECK (buyer_user_id = auth.uid());
