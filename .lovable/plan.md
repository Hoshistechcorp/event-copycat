# Phase 5 — Bloov Service refresh

Adopt the strongest editorial patterns from the second Stitch upload into `/bloov-service`, in iBloov's own brand (blue/amber, Plus Jakarta Sans, Lucide). No purple/cyan, no Material Symbols, no fake vendor numbers.

Three small, independently revertable changes.

---

## 5A — Search-led hero on `/bloov-service`

Replace the current "Two ways to plan" intro block with a focused vendor search hero.

- New layout in `src/pages/BloovService.tsx` hero section:
  - Eyebrow chip "BLOOV SERVICE" (kept).
  - Oversized headline: "Curate your" / `<span class="text-gradient-brand">event lineup.</span>` — `text-5xl md:text-7xl`, two lines.
  - One short subhead.
  - **Glass search bar** (`.glass-panel`, rounded-2xl, h-16): left search icon, input, inline `Filters` ghost button, `.btn-gradient-brand` Search button. Submits filter the vendor list below in-place (state already exists).
  - **Category chip row** directly under the search bar — horizontally scrollable on mobile (`overflow-x-auto`, `snap-x`), wraps on `md`. Selecting a chip filters the same vendor list (and clears with an "All" chip). Driven by `useVendorCategories()`.
  - `<AmbientGlow />` behind the hero (replaces the manual gradient div).
- The two big "Hire & Book" / "Pre-built" cards move down one section, becoming a smaller secondary "Two ways to plan" row below the vendor grid (still discoverable, no longer the first thing you see).

## 5B — Bento "Featured vendors" grid

Replace the uniform 4-col grid in the "Featured vendors" section with a bento layout, on `lg`. Mobile/tablet stay as the current responsive grid.

- New component `src/components/bloov/VendorBento.tsx`:
  - 12-col grid, 2 rows on `lg`.
  - Cell 1 (col-span-6, row-span-2): **Hero vendor card** — top-rated published vendor. Full-bleed `cover_url`, dark scrim, name + tagline + city + `from {formatPrice(base_price)}`, Verified badge if applicable, "View profile" CTA. All from real `useVendors()` data.
  - Cells 2 & 3 (col-span-3, row-span-1 each): standard `VendorCard` reused.
  - Cell 4 (col-span-3, row-span-2): **Tall vendor card** — second-highest rated, portrait crop.
  - Cell 5 (col-span-3, row-span-1): standard `VendorCard`.
  - Cell 6 (col-span-3, row-span-1): **"Request a custom package"** CTA tile — `.glass-panel` + `.glass-active`, brand gradient icon, headline "Can't find the right fit?", subhead, button routing to `/contact` (existing route).
- Empty state: if fewer than 5 published vendors, fall back to the current `VendorCard` grid so the bento never renders half-empty.
- Wire into `BloovService.tsx` "Featured vendors" section — the existing search/category state already filters `vendors`; bento receives filtered list.

## 5C — Reusable `CategoryChipRow`

Extract the chip row so it can be reused on `/events` later without duplication.

- New component `src/components/bloov/CategoryChipRow.tsx`:
  - Props: `categories`, `activeSlug`, `onSelect(slug | null)`.
  - Renders an "All" chip + one chip per category. Active chip uses `.glass-active` + `text-primary`; inactive uses `.glass-panel` + `text-muted-foreground`.
  - Horizontal scroll with snap on mobile, wrap on `md+`.
  - Lucide icon per category from `cat.icon_name` (same lookup pattern as `CategoryGrid`).
- Used by 5A in the hero. (Not wired into `/events` in this phase — extraction only, so a future phase can drop it in.)

---

## Out of scope (same rejections as prior phases)

- Purple / pink / cyan palette, Syne / Hanken Grotesk, Material Symbols.
- "VIP concierge", "Obsidian Loft", "$5k/night", 4.9★ counts, or any hardcoded vendor data.
- New tables, schema changes, or edits to `BloovServiceCategory` / `VendorProfile` detail pages.
- Touching `/events` filter UI (chip row is extracted but not yet adopted there).

---

## Technical notes

- All styling via existing tokens + Phase 1 utilities (`.glass-panel`, `.glass-active`, `.text-gradient-brand`, `.btn-gradient-brand`, `<AmbientGlow />`). No raw hex.
- Data sources unchanged: `useVendorCategories()`, `useVendors()`, `formatPrice()` from `CurrencyContext`.
- Filtering logic in `BloovService.tsx` extends current `search` state with an `activeCategory` slug; both apply to the same `filteredVendors` array consumed by the bento.
- Animations stay on framer-motion with existing spring presets.
- Files touched: `src/pages/BloovService.tsx` (edit). Files added: `src/components/bloov/VendorBento.tsx`, `src/components/bloov/CategoryChipRow.tsx`. No DB, no routes, no auth changes.
