

# iBLOOV — Product Requirements Document (PRD)

## 1. Product Overview

**iBLOOV** is a web-based event ticketing and management platform targeting the West African market (primarily Nigeria/Ghana). It serves two user personas: **Attendees** who discover and purchase event tickets, and **Event Hosts** who create events, sell tickets, manage earnings, and promote their events.

---

## 2. Architecture

### 2.1 Frontend Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Routing | React Router DOM v6 (client-side SPA) |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| State Management | React Context (Auth, Currency) + TanStack React Query (server state) |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |

### 2.2 Backend Stack (Lovable Cloud / Supabase)

| Layer | Technology |
|---|---|
| Database | PostgreSQL (managed) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Storage | Supabase Storage (event-images, avatars buckets — both public) |
| API | Supabase JS SDK (PostgREST auto-generated REST) |
| Edge Functions | Deno-based serverless functions (auto-deployed) |
| Realtime | Supabase Realtime (available, not yet enabled on any table) |
| Security | Row-Level Security (RLS) on all tables |

### 2.3 Application Architecture Diagram

```text
┌─────────────────────────────────────────────────┐
│                   Browser (SPA)                 │
│                                                 │
│  React Router ──► Page Components               │
│       │                  │                      │
│  Contexts:          UI Components:              │
│  - AuthContext      - shadcn/ui (Radix)         │
│  - CurrencyContext  - Custom components         │
│       │                  │                      │
│  Hooks:             Data Layer:                  │
│  - useAuth          - supabase client            │
│  - useDbEvents      - TanStack Query             │
│  - useCurrency      - localStorage (tickets)     │
└──────────────┬──────────────────────────────────┘
               │ HTTPS (Supabase JS SDK)
┌──────────────▼──────────────────────────────────┐
│              Lovable Cloud Backend               │
│                                                 │
│  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Auth    │  │ Storage  │  │  PostgreSQL   │  │
│  │ (email,  │  │ (images, │  │  (8 tables,   │  │
│  │  Google) │  │  avatars)│  │   RLS-secured)│  │
│  └─────────┘  └──────────┘  └───────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  Edge Functions (Deno, auto-deployed)    │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 Tables

| Table | Purpose | RLS |
|---|---|---|
| `profiles` | User profile data (display_name, avatar, withdrawal_pin) | Users CRUD own only |
| `events` | Event listings with metadata | Public read (published), hosts CRUD own |
| `ticket_tiers` | Pricing tiers per event | Public read (published events), hosts manage own |
| `performers` | Artist/speaker entries per event | Public read (published events), hosts manage own |
| `ticket_purchases` | Purchase records linking buyers to tiers | Buyers view own; hosts view for own events |
| `bank_accounts` | Host payout bank details | Users CRUD own only |
| `withdrawals` | Payout withdrawal requests | Users create/view own only |
| `promotions` | Paid event promotion campaigns | Hosts create/view own; public read active |

### 3.2 Database Functions & Triggers

- `handle_new_user()` — SECURITY DEFINER trigger on `auth.users` INSERT; auto-creates a `profiles` row.
- `update_updated_at_column()` — Generic timestamp trigger for `updated_at` fields.

### 3.3 Storage Buckets

- `event-images` — Public. Stores event cover images. Path: `{user_id}/{uuid}.{ext}`
- `avatars` — Public. Stores user avatars and performer images. Path: `{user_id}/avatar.{ext}` or `performers/{event_id}/{uuid}.{ext}`

---

## 4. Authentication & Authorization

### 4.1 Auth Methods
- **Email/Password** with mandatory email verification (no auto-confirm)
- **Google OAuth** via Supabase Auth

### 4.2 User Types
- **Attendee** — Default. Can browse events, purchase tickets, view tickets.
- **Event Host** — Selected at signup. Gets access to Dashboard, Wallet, Promotions, Bank Accounts, Withdrawal PIN.
- Account type stored in `user_metadata.account_type` (set during signup).

### 4.3 Security Model
- All database tables have RLS enabled.
- No admin/role table exists currently — authorization is purely user-based (own data only).
- Withdrawal PIN is stored in `profiles.withdrawal_pin` (plain text — **security gap identified**).

---

## 5. Feature Inventory

### 5.1 Public / Attendee Features

| Feature | Route | Data Source | Status |
|---|---|---|---|
| Landing Page | `/` | Static + hardcoded events | Complete |
| Event Discovery | `/events` | Hardcoded `allEvents[]` + DB events via `useDbEvents` | Complete |
| Event Detail | `/events/:id` | Hardcoded or DB (UUID detection) | Complete |
| Ticket Purchase (Checkout) | Modal on Event Detail | **localStorage only** — does NOT write to `ticket_purchases` table | **Integration gap** |
| My Tickets | `/my-tickets` | **localStorage lookup by email** | **Integration gap** |
| Ticket Detail | `/my-tickets/:ticketId` | localStorage | Complete (limited) |
| Multi-currency pricing | Global (CurrencyContext) | Static rates (NGN base) | Complete |
| About / Contact / FAQ / Privacy / Terms | `/about`, `/contact`, etc. | Static content | Complete |

### 5.2 Host Features

| Feature | Route | Status |
|---|---|---|
| Create Event (5-step wizard) | `/create-event` | Complete — writes to `events`, `ticket_tiers`, `performers`, uploads images |
| Edit Event | `/edit-event/:id` | Complete |
| Creator Dashboard — Overview | `/dashboard` (tab) | Complete — aggregates from `ticket_purchases` |
| Dashboard — My Events | `/dashboard` (tab) | Complete |
| Dashboard — Analytics | `/dashboard` (tab) | Complete with charts, CSV export |
| Dashboard — Wallet | `/dashboard` (tab) | Complete — real data from `ticket_purchases` + `withdrawals`, filterable transaction history, withdrawal modal with PIN verification |
| Dashboard — Promotions | `/dashboard` (tab) | Complete |
| Profile & Settings | `/profile` | Complete — personal info, bank accounts, withdrawal PIN, notifications, security |

### 5.3 Auth Pages

| Page | Route | Notes |
|---|---|---|
| Sign In | `/signin` | Email/password + Google OAuth, split-screen with carousel |
| Sign Up | `/signup` | Account type selection, password strength validation |
| Forgot Password | `/forgot-password` | Email reset flow |
| Reset Password | `/reset-password` | Token-based reset |

---

## 6. Integration Points & Data Flow

### 6.1 Event Creation Flow
```text
User fills wizard → Upload image to Storage → INSERT into events →
INSERT ticket_tiers → Upload performer avatars → INSERT performers →
Navigate to /events/{id}
```

### 6.2 Ticket Purchase Flow (CURRENT — broken integration)
```text
User selects ticket → Opens CheckoutModal → Enters name/email/quantity →
Simulates processing (setTimeout) → Saves to localStorage only →
Shows success → User can view via /my-tickets email lookup
```

**Gap**: The `CheckoutModal` does NOT insert into the `ticket_purchases` database table. It only uses `localStorage`. This means:
- Host wallet/dashboard shows no real sales data
- Tickets are device-bound (lost on clear/different device)
- No server-side purchase record exists

### 6.3 Wallet & Withdrawal Flow
```text
Host views wallet → Fetches ticket_purchases (for own events) + withdrawals →
Calculates gross earnings, 5% commission, available balance →
Initiates withdrawal via modal → Selects bank account → Enters PIN →
INSERT into withdrawals table
```

### 6.4 Dual Data Source Pattern
Events come from two sources:
1. **Hardcoded** (`src/data/events.ts`) — 6 static demo events with numeric IDs
2. **Database** (`useDbEvents` hook) — real events with UUID IDs

The app detects UUIDs to route to DB events vs hardcoded ones. Both are merged in the Events listing page.

---

## 7. Known Gaps & Technical Debt

| # | Issue | Severity | Description |
|---|---|---|---|
| 1 | **Checkout not integrated with DB** | Critical | `CheckoutModal` saves to localStorage, not `ticket_purchases`. Hosts see no real revenue. |
| 2 | **Withdrawal PIN stored as plain text** | High | `profiles.withdrawal_pin` should be hashed (bcrypt or similar via edge function). |
| 3 | **No payment gateway** | Critical | No actual payment processing (Paystack, Flutterwave, Stripe). Checkout is simulated. |
| 4 | **Static currency rates** | Medium | Exchange rates are hardcoded in `CurrencyContext`. Should fetch live rates or update periodically. |
| 5 | **No email notifications** | Medium | No transactional emails (purchase confirmation, withdrawal status, event reminders). |
| 6 | **Notification preferences are UI-only** | Low | `ProfileNotifications` toggles have no backend persistence. |
| 7 | **Search is non-functional** | Medium | Navbar search input has no `onChange` handler or search logic. |
| 8 | **No ticket validation/QR codes** | Medium | Ticket detail shows placeholder QR. No scan/check-in system. |
| 9 | **No realtime updates** | Low | Realtime not enabled on any table. Host dashboard doesn't live-update on new sales. |
| 10 | **Hardcoded demo events** | Low | 6 static events in `data/events.ts` create a dual-source pattern that adds complexity. |

---

## 8. Security Summary

- **RLS**: Enabled on all 8 tables with appropriate policies.
- **Auth**: Email verification required. Google OAuth supported.
- **Storage**: Both buckets are public (acceptable for event images and avatars).
- **Missing**: No admin role system. No rate limiting. No CSRF protection beyond Supabase defaults. PIN stored unhashed.

---

## 9. Recommended Next Steps (Priority Order)

1. **Integrate checkout with `ticket_purchases` table** — Replace localStorage with real DB inserts so host dashboards reflect actual sales.
2. **Add payment gateway** (Paystack recommended for Nigerian market) — Process real payments before recording purchases.
3. **Hash withdrawal PINs** — Use an edge function with bcrypt to hash/verify PINs.
4. **Enable realtime** on `ticket_purchases` for live dashboard updates.
5. **Implement functional search** across events.
6. **Add transactional email** via edge functions for purchase confirmations and withdrawal notifications.
7. **Persist notification preferences** to the database.
8. **Generate real QR codes** for ticket validation and build a check-in system.

