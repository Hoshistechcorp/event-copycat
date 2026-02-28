
-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  venue TEXT NOT NULL,
  venue_address TEXT,
  category TEXT DEFAULT 'general',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket_tiers table
CREATE TABLE public.ticket_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 100,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT
  USING (status = 'published');

CREATE POLICY "Hosts can view own events"
  ON public.events FOR SELECT
  TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can create events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update own events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete own events"
  ON public.events FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

-- Ticket tiers policies
CREATE POLICY "Anyone can view ticket tiers for published events"
  ON public.ticket_tiers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_tiers.event_id AND (events.status = 'published' OR events.host_id = auth.uid())));

CREATE POLICY "Hosts can manage ticket tiers for own events"
  ON public.ticket_tiers FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_tiers.event_id AND events.host_id = auth.uid()));

CREATE POLICY "Hosts can update ticket tiers for own events"
  ON public.ticket_tiers FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_tiers.event_id AND events.host_id = auth.uid()));

CREATE POLICY "Hosts can delete ticket tiers for own events"
  ON public.ticket_tiers FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_tiers.event_id AND events.host_id = auth.uid()));

-- Timestamp trigger for events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for event images and avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for event images
CREATE POLICY "Anyone can view event images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-images');

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
