## Scope

Four parallel workstreams built on top of the existing Bloov platform.

---

### 1. Sponsorship Marketplace (new module)

**New tables (migration):**
- `brands` — `id, owner_user_id, name, logo_url, website, industry, description, hq_country, hq_city, budget_min, budget_max, currency, target_event_types text[], target_audience text[], preferred_styles text[], preferred_locations text[], is_published`
- `sponsorship_listings` — host-side: `id, host_id, event_id (nullable), title, description, audience_size, demographics jsonb, asking_amount, currency, perks text[], status, hero_image_url`
- `sponsorship_offers` — `id, brand_id, listing_id (nullable), event_id (nullable), host_id, amount, currency, message, status (pending/accepted/declined/withdrawn)`
- RLS: brands viewable when published or by owner; listings viewable when published; offers visible to brand owner and host.

**New pages:**
- `/sponsorships` — discovery feed of sponsorship listings (filter by event type, budget, location, audience)
- `/sponsorships/listings/:id` — listing detail + "Send offer" button (brand-side)
- `/sponsorships/brands` — browse brands looking to sponsor
- `/sponsorships/brands/:id` — brand profile with event preferences
- `/brand/setup` — brand onboarding wizard: industry → budget range → target event types (multi-select) → audience → location style (urban/festival/luxury/intimate) → preferred cities/countries
- Dashboard tab `DashboardSponsorships` — split view: "My listings" (host) and "My offers" (brand)

**Hooks:** `useBrands`, `useSponsorshipListings`, `useSponsorshipOffers`.

---

### 2. Currency selector relocation

- Remove `<CurrencySelector />` from `Navbar.tsx`.
- Add a "Display currency" section to `Profile.tsx` (new `ProfileCurrency.tsx`) that reads/writes via `useCurrency()` and persists in localStorage as today.

---

### 3. Improved global city/country picker

- New shared component `LocationPicker.tsx`:
  - Country `<Select>` powered by a curated `countries.ts` list (ISO + flag emoji + popular cities array).
  - City field with autocomplete (`cmdk` `Command`) suggesting from the country's city list, plus free-text fallback.
  - Emits `{ country, city }`.
- Adopt in: `BloovExperiences.tsx`, `BloovCreateWizard.tsx`, `HeroSection.tsx`, brand setup wizard, sponsorship listing form.

---

### 4. Currency-aware payment routing

**No real charges yet** (Phase 1 still simulated) — build the routing layer so future hooks plug in cleanly.

- `src/lib/paymentRouter.ts`:
  ```ts
  type Gateway = "stripe" | "stripe_connect" | "paystack" | "flutterwave" | "wise";
  routeGateway(currency: string, country?: string): { gateway: Gateway; reason: string }
  ```
  Rules:
  - NGN → Paystack
  - GHS, KES, ZAR → Flutterwave
  - USD/EUR/GBP/CAD/AUD/JPY/AED → Stripe Connect
  - INR, BRL → Wise (cross-border)
  - Default → Stripe
- Surface the chosen gateway in `BookingDialog.tsx` and `CheckoutModal.tsx` ("Payment routed via Stripe Connect").
- `DashboardWallet.tsx` shows per-currency payout rail badges driven by `routeGateway`.
- Defer: actual edge functions for each gateway. Add TODO scaffolds only.

---

### 5. Event Planner page (`/event-planner`)

Full-service planning workspace distinct from `/bloov-create/wizard`:

- Step 1: event basics (type, date, LocationPicker, guest count, budget, vibe).
- Step 2: pick venues (filtered vendors where `category.slug = 'venues'` matching city).
- Step 3: pick vendors per recommended category for the event type (chip-select multiple per category).
- Step 4: review → "Generate execution plan" → creates `events` row (status=`draft`) + bulk-inserts `event_vendor_assignments` with auto-spaced `scheduled_at` timestamps relative to event date (e.g. setup -4h, decor -3h, catering -2h, etc.).
- Redirect to `/events/:id/timeline` on success.
- Add nav entry "Event Planner" in `Navbar.tsx` and dashboard sidebar.

---

## Out of scope (this round)
- Real Stripe/Paystack/Flutterwave/Wise edge function integration (scaffold only).
- AI-powered sponsorship matching.
- Brand verification workflow.

## Files (high level)
- Migration: brands, sponsorship_listings, sponsorship_offers + RLS
- New: `src/lib/paymentRouter.ts`, `src/lib/countries.ts`, `src/components/LocationPicker.tsx`, `src/components/profile/ProfileCurrency.tsx`, `src/hooks/useBrands.ts`, `src/hooks/useSponsorships.ts`, `src/pages/Sponsorships.tsx`, `src/pages/SponsorshipListingDetail.tsx`, `src/pages/Brands.tsx`, `src/pages/BrandProfile.tsx`, `src/pages/BrandSetup.tsx`, `src/pages/EventPlanner.tsx`, `src/components/dashboard/DashboardSponsorships.tsx`
- Edited: `Navbar.tsx`, `Profile.tsx`, `Dashboard.tsx`, `App.tsx`, `BookingDialog.tsx`, `CheckoutModal.tsx`, `DashboardWallet.tsx`, `HeroSection.tsx`, `BloovExperiences.tsx`, `BloovCreateWizard.tsx`
