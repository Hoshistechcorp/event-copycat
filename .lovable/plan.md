# Bloov Create & Bloov Service — Phased Build Plan

This plan ships **Phase 1** end-to-end and lays out the roadmap for Phases 2–15. Each later phase is a separate build to keep the app stable and the scope manageable.

---

## Phase 1 — Entry Module (this build)

### 1.1 Landing page banner swap

Replace the two CTA cards on `src/pages/Index.tsx` ("Host an Event" / "Buy Tickets") with two new cards:

- **Bloov Create** — "Dream it. Launch it. Sell it out." → routes to `/bloov-create`
- **Bloov Service** — "The full event-as-a-service marketplace." → routes to `/bloov-service`

Keep the same animated, edge-to-edge card aesthetic, but introduce a vibrant nightlife gradient + glassmorphism treatment to set the new visual direction. Generate two new hero images (`cta-bloov-create.jpg`, `cta-bloov-service.jpg`).

### 1.2 Navigation

Add **"Bloov Service"** and **"Bloov Create"** entries to:

- `src/components/Navbar.tsx` — desktop nav + mobile hamburger menu
- Dashboard tab bar in `src/pages/Dashboard.tsx` — new "Bloov Service" tab next to Promote
- Add `Sparkles` / `Store` icons (lucide-react) to match the visual language

### 1.3 New routes (registered in `src/App.tsx`)

| Route | Page | Purpose |
|---|---|---|
| `/bloov-create` | `pages/BloovCreate.tsx` | Bloov Create landing dashboard |
| `/bloov-service` | `pages/BloovService.tsx` | Bloov Service marketplace landing |
| `/bloov-service/category/:slug` | `pages/BloovServiceCategory.tsx` | Vendor list filtered by category |
| `/bloov-service/vendors/:id` | `pages/VendorProfile.tsx` | Public vendor profile |
| `/bloov-service/packages/:id` | `pages/PackageDetail.tsx` | Pre-built package detail |

### 1.4 Bloov Create landing dashboard (`/bloov-create`)

Sections (all UI shells now, AI deferred to Phase 2):

- Hero with **"Create New Event Idea"** CTA
- Trending event ideas carousel (reads from `event_ideas` table)
- Inspiration moodboard grid
- Creator earnings potential strip (static for now)
- Upcoming city trends row
- Viral event concepts section
- Sponsorship opportunities teaser → links to Phase 4

### 1.5 Bloov Service marketplace landing (`/bloov-service`)

Sections:

- Hero with category search bar
- **Vendor category grid** (15 categories — venues, photographers, DJs, MCs, caterers, decorators, florists, security, bartenders, transportation, makeup, planners, ushers, lighting, traditional vendors)
- **Featured vendors** carousel (reads from `vendors` table)
- **Pre-built packages** showcase (reads from `event_packages` table)
- Wedding planning mode entry card
- AI Concierge teaser → links to Phase 14

### 1.6 Database scaffolding

New tables (all RLS-enabled). Standard `id`, `created_at`, `updated_at` omitted from descriptions.

**`vendor_categories`** — public reference table
- slug, name, description, icon_name, sort_order
- Public read; only service role writes

**`vendors`**
- owner_user_id, category_id, business_name, tagline, bio, city, country, base_price, currency, avatar_url, cover_url, portfolio_urls (text[]), rating, review_count, is_verified, is_published
- Public read where `is_published = true`; owners CRUD own

**`vendor_availability`**
- vendor_id, date, status (available/booked/blocked)
- Public read for published vendors; owners manage own

**`event_packages`**
- title, slug, description, category, base_price, currency, guest_capacity, hero_image_url, gallery_urls (text[]), included_vendor_categories (text[]), timeline_json (jsonb), is_published
- Public read where published; service role writes for now (curated)

**`bookings`**
- requester_user_id, vendor_id, event_id (nullable), package_id (nullable), event_date, status (requested/accepted/declined/completed/cancelled), total_amount, deposit_amount, currency, notes
- Requesters view/create own; vendors view/update bookings where they're the vendor

**`event_ideas`** (Phase 1 seeded, Phase 2 AI-generated)
- title, concept, city, country, audience_type, est_attendance, est_ticket_price, currency, trend_score, hero_image_url, tags (text[])
- Public read; service role writes

**Seed data**: 15 vendor categories, ~12 sample vendors, 7 pre-built packages (Luxury Wedding, Nigerian Traditional Wedding, Silent Disco, Creator Party, Corporate Mixer, Rooftop Experience, Festival), and ~8 trending event ideas.

### 1.7 Files added / changed

```text
ADDED
  src/pages/BloovCreate.tsx
  src/pages/BloovService.tsx
  src/pages/BloovServiceCategory.tsx
  src/pages/VendorProfile.tsx
  src/pages/PackageDetail.tsx
  src/components/bloov/BloovHeroCard.tsx
  src/components/bloov/VendorCard.tsx
  src/components/bloov/PackageCard.tsx
  src/components/bloov/CategoryGrid.tsx
  src/components/bloov/EventIdeaCard.tsx
  src/hooks/useVendors.ts
  src/hooks/usePackages.ts
  src/hooks/useEventIdeas.ts
  src/assets/cta-bloov-create.jpg
  src/assets/cta-bloov-service.jpg
  supabase/migrations/<timestamp>_bloov_service_schema.sql

CHANGED
  src/App.tsx                  # 5 new routes
  src/pages/Index.tsx          # banner swap
  src/components/Navbar.tsx    # add Bloov Service + Bloov Create
  src/pages/Dashboard.tsx      # add Bloov Service tab
```

### 1.8 Design direction (Phase 1 sets the tone for all later phases)

- Vibrant nightlife gradients (magenta → indigo → cyan), glassmorphism cards, oversized display typography
- Large image-led cards (Airbnb / Pinterest), animated hover lifts (Framer Motion)
- Rounded `2rem` radii, soft glow shadows, semantic tokens only (no hard-coded colors)

---

## Roadmap — Phases 2 through 15

Each phase is a separate build. Phase 1 lays the data + nav foundation so each later phase plugs in without refactors.

| Phase | Feature | Depends on |
|---|---|---|
| 2 | AI Event Idea Engine (deferred AI, Lovable AI Gateway later) | Phase 1 |
| 3 | "Test My Event" waitlist validation + analytics | Phase 1 |
| 4 | Sponsorship marketplace + sponsor dashboard | Phase 1, 3 |
| 5 | Event Investor Mode | Phase 3, 4 |
| 6 | AI-generated Event Execution Blueprints | Phase 1 |
| 7 | Full Bloov Service marketplace search/filter/reviews | Phase 1 |
| 8 | Pre-built package customization + vendor swap | Phase 1, 7 |
| 9 | Vendor dashboard (bookings, calendar, earnings, portfolio mgmt) | Phase 1, 7 |
| 10 | VibesGigs staffing integration | Phase 7, 9 |
| 11 | Event Commerce (merch, food preorder, table reservations, VIP) | existing ticketing |
| 12 | TribeMint affiliate integration | Phase 1, 7 |
| 13 | AuraLink microsite generation | Phase 1, 7 |
| 14 | AI Event Concierge (Lovable AI Gateway) | Phase 1, 6, 7 |
| 15 | UI/UX polish pass — animations, gradients, typography system | all |

---

## Technical notes (Phase 1)

- Migration tool will be called **first** (separate approval) to create the 6 new tables, RLS policies, and seed data. Then code edits land in a follow-up.
- All vendor/package fetches go through TanStack Query hooks (`useVendors`, `usePackages`, `useEventIdeas`) for caching consistent with the rest of the app.
- New components live under `src/components/bloov/` to keep the namespace clean and make Phase 7+ extensions easy.
- The dashboard "Bloov Service" tab reuses the existing tab pattern from `Dashboard.tsx` — no router changes needed inside the dashboard.
- No changes to `auth`, ticketing, wallet, or existing event creation flows in Phase 1.
