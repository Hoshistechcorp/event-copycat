
-- Create performers table for events
CREATE TABLE public.performers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Performer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;

-- Anyone can view performers for published events (or own events)
CREATE POLICY "Anyone can view performers for published events"
ON public.performers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = performers.event_id
    AND (events.status = 'published' OR events.host_id = auth.uid())
  )
);

-- Hosts can insert performers for own events
CREATE POLICY "Hosts can insert performers for own events"
ON public.performers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = performers.event_id
    AND events.host_id = auth.uid()
  )
);

-- Hosts can update performers for own events
CREATE POLICY "Hosts can update performers for own events"
ON public.performers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = performers.event_id
    AND events.host_id = auth.uid()
  )
);

-- Hosts can delete performers for own events
CREATE POLICY "Hosts can delete performers for own events"
ON public.performers FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = performers.event_id
    AND events.host_id = auth.uid()
  )
);
