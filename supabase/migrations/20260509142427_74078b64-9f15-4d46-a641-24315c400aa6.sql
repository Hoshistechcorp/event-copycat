
CREATE TABLE public.aura_product_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT false,
  sort_index INTEGER NOT NULL DEFAULT 0,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.aura_product_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own aura links" ON public.aura_product_links
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own aura links" ON public.aura_product_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own aura links" ON public.aura_product_links
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own aura links" ON public.aura_product_links
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_aura_product_links_updated_at
  BEFORE UPDATE ON public.aura_product_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_events_host_status ON public.events(host_id, status);
