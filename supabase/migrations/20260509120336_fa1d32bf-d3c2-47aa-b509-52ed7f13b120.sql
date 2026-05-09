-- Add Event Planner vendor category and a pre-built planner package
INSERT INTO public.vendor_categories (slug, name, description, icon_name, sort_order)
VALUES ('event-planner', 'Event Planner', 'Full-service planners who design and execute your event end-to-end.', 'ClipboardList', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.event_packages (slug, title, description, category, base_price, currency, guest_capacity, hero_image_url, included_vendor_categories, is_published)
VALUES (
  'full-service-planner',
  'Full-Service Event Planner',
  'A dedicated planner handles vendors, timeline, logistics, and on-site execution from start to finish — anywhere in the world.',
  'planning',
  450000,
  'NGN',
  300,
  null,
  ARRAY['event-planner','venue','catering','decor','photography'],
  true
)
ON CONFLICT (slug) DO NOTHING;