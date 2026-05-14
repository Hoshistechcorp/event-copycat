ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS donate_flexit_url text,
  ADD COLUMN IF NOT EXISTS donate_flexit_qr_url text;