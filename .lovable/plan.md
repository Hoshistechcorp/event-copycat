## Goal

Adopt the strongest patterns from the Stitch upload (glassmorphism cards, mobile bottom tab bar, bento dashboard, oversized gradient hero) **without** changing iBloov's brand. We keep Plus Jakarta Sans, blue/amber primary, dark theme. We reject the purple/pink/cyan palette, "Bloov Workspace / Upgrade to VIP" surface, Material Symbols font, and all hardcoded mock numbers.

Work is split into 4 small phases so each is shippable on its own.

---

## Phase 1 — Reusable glass + glow utilities

Add design tokens once so every later phase can reuse them.

- Add CSS utilities to `src/index.css`:
  - `.glass-panel` — translucent fill + 1px border + 20px backdrop blur (themed with `--card` / `--border`, not white).
  - `.glass-active` — adds a soft inner glow using `--primary` and outer drop shadow using `--accent`.
  - `.divider-glow` — 1px horizontal gradient that fades to transparent.
  - `.text-gradient-brand` — `--primary` → `--accent` text gradient (replaces the manual gradient currently inlined in 5+ places).
  - `.btn-gradient-brand` — primary→accent gradient with subtle inner top highlight.
- Add a tiny ambient-glow helper component `src/components/ui/AmbientGlow.tsx` (two blurred radial blobs, themed via tokens) to drop into hero sections.

No visual change yet beyond what later phases consume.

---

## Phase 2 — Mobile bottom tab bar (biggest UX win)

Today on mobile users only have a hamburger. Add a persistent bottom tab bar so the app feels native.

- New component `src/components/MobileTabBar.tsx`, fixed bottom, `lg:hidden`, safe-area padding, glass-panel styling.
- Tabs (signed-in): **Home** (`/`), **Discover** (`/events`), **Create** (host → `/create-event`, attendee → `/bloov-create`), **Tickets** (`/my-tickets`), **Profile** (`/profile`).
- Tabs (signed-out): **Home**, **Discover**, **Sign in**, with the Create slot pointing to `/signin`.
- Active state: filled icon + brand color + small pill background, using Lucide (no Material Symbols).
- Mounted globally in `src/App.tsx` so it appears on every route.
- Add `pb-20 lg:pb-0` spacer to page wrappers (or a global `body` rule) so content isn't hidden behind the bar.
- Keep the hamburger Sheet — it stays for the long tail of links (Sponsorships, Bloov Service, Settings, Sign out). Bottom bar covers the top 5 destinations.

---

## Phase 3 — Bento dashboard overview

Restructure the `/dashboard` overview tab from "4 equal stat cards" into a bento grid that leads with one big hero card.

- Replace the current `DashboardOverview` 4-card grid with a 12-col bento on `lg`, single column on mobile:
  - **8-col hero card** — featured upcoming event (image background, scrim, title, date/venue, "Manage event" CTA). If no upcoming event: a "Create your first event" empty state with the brand gradient CTA.
  - **4-col stack** — two cards:
    - "Projected payout" card using *real* data: sum of `ticket_purchases.total_amount` for the host's published events, minus 5% commission, formatted via `formatPrice()`. No fake "+14% MoM" — show real change vs previous 30 days, or hide the delta if no history.
    - "Top city" card driven by the host's own published events (most common venue city). No fabricated demand percentages.
- Keep the existing 4 stat cards, but move them *below* the bento as a secondary row.
- Apply `.glass-panel` styling to all cards.
- Pinned AURA products row stays where `DashboardHomeHero` already puts it.

No new tables — everything reads from existing `events` and `ticket_purchases`.

---

## Phase 4 — Bloov Create hero refresh

Tighten the `/bloov-create` hero with the upload's poster-style headline, in iBloov colors.

- Replace the current hero block in `src/pages/BloovCreate.tsx`:
  - Oversized headline: "Create" / `<span class="text-gradient-brand">the vibe.</span>` — `text-6xl md:text-8xl`, tighter tracking, two lines.
  - Subhead kept short and punchy.
  - Primary CTA: `.btn-gradient-brand` "Create New Event Idea" (keeps existing route).
  - Replace inline blurred blob divs with the new `<AmbientGlow />` component.
- No copy changes referencing nightlife, VIP, or "warehouse" — keep iBloov's global, neutral tone.

---

## Explicitly out of scope

- Purple/pink/cyan palette, Syne / Hanken Grotesk / Space Grotesk fonts, Material Symbols icon font.
- "Bloov Workspace" sidebar, "Upgrade to VIP" CTA, paid tier surface.
- Desktop left sidebar (we already have a top Navbar — only one nav model).
- Any hardcoded mock numbers ($42.8k, +89% Surging Demand, +24 creators, etc.).
- Renaming `/bloov-service` or building a new "Service Operating System" page — the upload's filename was misleading; the actual content is a Create dashboard.

---

## Technical notes

- All new colors stay HSL via existing `--primary`, `--accent`, `--card`, `--border`, `--background` tokens. No raw hex in components.
- Reuse `useDbEvents`, the existing `aura_product_links` query in `useAuraLinks`, and `formatPrice()` from `CurrencyContext`.
- Animations stay on framer-motion with the existing spring presets.
- Each phase is independently revertable: Phase 1 only adds CSS; Phase 2 only adds one component + one App.tsx mount; Phase 3 edits Dashboard overview only; Phase 4 edits BloovCreate hero only.

Ship Phase 1+2 together (foundation + biggest UX win), then 3, then 4.