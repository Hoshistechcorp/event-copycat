
# Plan: Event Planner Polish + Sponsorship Marketplace + AURA App Launcher

Three focused workstreams. All visual work uses existing semantic tokens (dark theme, blue/amber primary, Plus Jakarta Sans), spring/fade animations, and global currency via `formatPrice()`.

---

## 1. Event Planner Draft Flow (`/event-planner`)

Make the wizard editable, auto-build a timeline preview, and persist drafts to the dashboard.

- **Editable draft panel**: After Step 1, show a sticky "Draft summary" card (event name, type, date, location, guests, budget, vibe). Each field has an inline pencil to jump back to that step. Use `LocationPicker` for global cities.
- **Auto-generated timeline preview** (Step 4): Compute `scheduled_at` offsets per selected vendor category (Venue −8h, Decor −6h, Catering −3h, Photo −2h, DJ −1h, Planner all-day) and render a vertical timeline with drag-to-reorder. User can edit duration/notes inline before saving.
- **Save Draft action**: New `status: 'draft'` on `events` rows. Two CTAs at the end:
  - **Save Draft** → inserts event + assignments with `status='draft'`, toast "Saved to dashboard", routes to `/dashboard?tab=drafts`.
  - **Generate & Publish Plan** → existing flow (status `planned`, redirects to `/events/:id/timeline`).
- **Dashboard "My Plans" tab**: New `DashboardPlans.tsx` listing draft + planned events with Resume / Delete / Open Timeline. Added to `Dashboard.tsx` tabs.
- **Resume editing**: `/event-planner?draft=:id` rehydrates the wizard from the saved row.

**DB**: migration adds `status` column to `events` (`draft|planned|live|done`, default `draft`) if not present, and an index on `(user_id, status)`.

---

## 2. Public Sponsorship Marketplace (`/sponsorships`)

Upgrade the existing `Sponsorships.tsx` from a basic list into a discoverable, filterable marketplace (no auth required to browse).

- **Hero + search bar**: Headline, sub-copy, prominent search input (matches against listing title, event type, brand fit).
- **Filter rail** (sticky on desktop, drawer on mobile):
  - Event type (multi-select chips: Concert, Conference, Wedding, Festival, Sports, Workshop, Other)
  - Location (uses `LocationPicker` — country + city)
  - Audience size (slider buckets: <100, 100–500, 500–2k, 2k–10k, 10k+)
  - Budget range (uses `formatPrice` — currency-aware)
  - Sort: Newest, Highest budget, Largest audience
- **Result grid**: Card per `sponsorship_listings` row showing event banner, host, location flag, audience badge, budget range, "View opportunity" CTA → existing `/sponsorships/listings/:id`.
- **Empty/loading states**: skeleton cards + friendly empty message with CTA "Create a listing".
- **Hooks**: extend `useSponsorships.ts` with `useFilteredListings(filters)` (client-side filter on the existing query — no schema change needed; listing already has event_type, location, audience_size, budget fields per prior migration).

---

## 3. AURA "Nebula Menu" — 9-Dot App Launcher

A universal product switcher accessible from the navbar across the app.

### Phase 1 — Trigger & Drawer
- New `src/components/aura/NebulaMenu.tsx` mounted in `Navbar.tsx` (right side, before avatar). 9-dot `Grid3x3` icon button.
- Opens a `Popover` (desktop) / `Sheet` bottom-drawer (mobile) with **glassmorphism** panel: `bg-background/60 backdrop-blur-xl border border-white/10`, neon ring glow.
- Sticky header: "Your iBloov Orbit" + search input that filters tiles in real time.

### Phase 2 — Product Grid
- Responsive grid: `grid-cols-3 md:grid-cols-3 xl:grid-cols-4`, square aspect tiles.
- Each tile: vector Lucide icon + product name + hover lift (`hover:-translate-y-1`) + colored glow ring matching brand.
- Product registry in `src/lib/auraProducts.ts`:

| Product | Color | Icon | Route |
|---|---|---|---|
| AuraLink | teal | UserCircle | `/profile` |
| Bloov | purple | Sparkles | `/events` |
| TribeMint | pink | Users | `/tribemint` (new stub) |
| VibesGigs | green | Briefcase | `/vibesgigs` (stub) |
| Flex-it | emerald | Wallet | `/flexit` (stub) |
| Sportmate | orange | Trophy | `/sportmate` (stub) |
| iBloov POV | yellow | Camera | `/pov` (stub) |
| Spark | blue | Award | `/spark` (stub) |
| Kia Travel | cyan | Plane | `/kia-travel` (stub) |

Each stub page = simple "Coming soon" landing with brand color hero (placeholders so links don't 404).

### Phase 3 — Linked / Unlinked State
- New table `aura_product_links` (`user_id`, `product_id`, `linked_at`, `pinned`). RLS: owner-only.
- Hook `useAuraLinks()` returns `{ links, link(productId), unlink(productId), togglePin(productId) }`.
- Tile rendering:
  - **Linked** → full color, click routes to product.
  - **Unlinked** → desaturated (`grayscale-[60%] opacity-70`) + glowing "Set Up" badge top-right.
- **Setup modal** (`AuraSetupDialog.tsx`): "Initialize [Product]", lists data shared ("Identity, Flex-it Wallet, Reputation Score"), single "1-Click Sync via AuraLink" button → inserts row into `aura_product_links`, toast, navigate to product.
- AuraLink itself is implicitly always linked (the identity root).

### Phase 4 — Drag-and-Drop & Pin to Nav
- Use `@dnd-kit/core` + `@dnd-kit/sortable` (add dependency) to reorder tiles. Order persisted in `aura_product_links.sort_index` (added via same migration).
- Hover reveals a "Pin to Nav" pin icon. Toggling sets `pinned=true`. Max 3 pinned.
- `Navbar.tsx` renders pinned product icons inline (between main links and avatar) as quick-access buttons with their brand color.

### Migration
Single migration adds:
- `events.status` text column (default `'draft'`)
- `aura_product_links` table (`id`, `user_id`, `product_id text`, `linked_at`, `pinned bool`, `sort_index int`) with RLS policies (select/insert/update/delete where `auth.uid() = user_id`) and a unique `(user_id, product_id)` constraint.

---

## Out of Scope
- Real OAuth/SSO between AURA products (sync is simulated — just a link record).
- Server-side filtering / full-text search for sponsorships (client-side is enough at current data volume).
- Building out actual TribeMint / Flex-it / Sportmate features — only stub landing pages so the launcher routes resolve.

## Files

**New**: `src/components/aura/NebulaMenu.tsx`, `src/components/aura/AuraTile.tsx`, `src/components/aura/AuraSetupDialog.tsx`, `src/lib/auraProducts.ts`, `src/hooks/useAuraLinks.ts`, `src/components/dashboard/DashboardPlans.tsx`, `src/pages/aura/{TribeMint,VibesGigs,Flexit,Sportmate,POV,Spark,KiaTravel}.tsx`, plus migration.

**Edited**: `src/pages/EventPlanner.tsx`, `src/pages/Sponsorships.tsx`, `src/hooks/useSponsorships.ts`, `src/components/Navbar.tsx`, `src/pages/Dashboard.tsx`, `src/App.tsx`.

**Dependency added**: `@dnd-kit/core`, `@dnd-kit/sortable`.
