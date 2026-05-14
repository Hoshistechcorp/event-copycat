-- Add creator refund policy field to events
ALTER TABLE public.events ADD COLUMN refund_policy TEXT;
