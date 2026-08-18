# Nexus Dash

An AI-powered e-commerce operations dashboard built as a production-grade MVP. Real-time data, three distinct AI surfaces, a live simulation engine, and a cyberpunk design system — built in Next.js 16 App Router with a full backend stack.

**Live demo:** [nexusdash-beta.vercel.app](https://nexusdash-beta.vercel.app)

**Demo credentials:** `admin@nexus.com` (no password required in MVP mode)

---

## What It Does

Nexus Dash gives e-commerce operators a single interface to monitor revenue, manage orders, track inventory, and get AI-generated insights — all updating in real time.

A background simulation engine continuously generates orders, adjusts prices, and onboards new customers, keeping the dashboard live and the AI contextually aware.

---

## Tech Stack

| Layer         | Technology                                          |
| ------------- | --------------------------------------------------- |
| Framework     | Next.js 16 (App Router, React Server Components)    |
| Frontend      | React 19, Tailwind CSS v4, Framer Motion 12         |
| UI Primitives | shadcn/ui (Radix Nova), Phosphor Icons, Recharts    |
| Typography    | Orbitron (display), Geist (body), Geist Mono (data) |
| AI            | Groq SDK — `llama-3.3-70b-versatile`                |
| Auth          | NextAuth v5 — JWT strategy, credentials provider    |
| Database      | PostgreSQL via Neon (serverless)                    |
| ORM           | Prisma 7 with PrismaPg driver adapter               |
| Deployment    | Vercel (free tier)                                  |

---

## Features

### Dashboard Pages

* **Overview** — 4 animated metric cards (revenue, orders, customers, low stock), 30-day revenue area chart, recent orders table, AI insights banner
* **Orders** — filterable by status, paginated, expandable rows showing line items per order
* **Products** — category filter, animated stock level bars, low stock warnings, order count per SKU
* **Customers** — live search, spend bars, ranked by total spend, join date
* **AI Assistant** — full-page chat with suggestion chips, export transcript, streaming responses

### AI Surfaces (Groq)

Three distinct AI integrations, all streaming via `ReadableStream`:

1. **Insights Banner** — on every dashboard load, Groq analyzes live store metrics and streams a 2-sentence insight with an actionable recommendation. Refreshes automatically on each data tick.
2. **Chat Drawer** — floating assistant accessible from any page. Maintains conversation history, has full store context (revenue, top products with prices, low stock by name, order breakdown, customer counts). Formats responses as structured lists, not walls of text.
3. **Full Chat Page** — same engine in a full-page layout with 8 suggestion chips and transcript export.

### Live Simulation Engine

A background engine generates realistic e-commerce activity every 60 seconds:

* **0 orders** — 15% chance
* **1 order** — 60% chance
* **2 orders** — 25% chance
* 1–2 products per order, almost always quantity 1
* **Price variance** — ±2% on a random product per tick, clamped to ±15% of original
* **New customers** — 15% chance per tick, generated from name/city pools and deduplicated by email
* **Restock** — 25% chance when any product hits ≤5 units, adding 10–25 units
* **Client-driven** via 60-second polling — compatible with Vercel free tier

---

## Design System

Custom cyberpunk aesthetic built on Tailwind v4 CSS custom properties:

* **Accent** — neon orange `#FF5F1F` (`oklch(0.65 0.22 34)`) throughout
* **Fluted glass** — signature surface material using repeating vertical gradients + `backdrop-filter: blur`
* **Scanline overlay** — fixed `body::before` CRT texture at 1.8% opacity
* **Dark mode forced** — `class="dark"` hardcoded on `<html>`, no toggle
* **Spring physics** — Framer Motion with `stiffness: 120, damping: 18` as the house curve
* **`layoutId` nav indicator** — single shared element morphs between active states

---

## Architecture

```text
nexus-dash/
├── app/
│   ├── (auth)/              ← Login shell, separate layout tree
│   ├── (dashboard)/         ← Dashboard shell, all protected routes
│   │   ├── page.tsx         ← Overview (force-dynamic, SSR)
│   │   ├── orders/
│   │   ├── products/
│   │   ├── customers/
│   │   └── ai-assistant/
│   └── api/
│       ├── auth/            ← NextAuth handlers
│       ├── ai/chat/         ← Groq streaming chat
│       ├── ai/insights/     ← Groq streaming banner insight
│       └── simulate/cron/   ← Simulation tick endpoint
├── components/
│   ├── dashboard/           ← MetricCard, RevenueChart, OrdersTable,
│   │                           ProductsTable, CustomersTable,
│   │                           AIInsightsBanner, Sidebar, Topbar
│   ├── ai/                  ← ChatDrawer, ChatFull, ChatMessage
│   └── providers/           ← SimulatorProvider, SidebarProvider,
│                               PageTransition
├── lib/
│   ├── data.ts              ← All DB queries (data access layer)
│   ├── simulator.ts         ← Tick engine
│   ├── groq.ts              ← Groq singleton
│   ├── prisma.ts            ← Prisma singleton with PrismaPg adapter
│   ├── auth.ts              ← NextAuth config
│   └── utils.ts             ← cn, formatCurrency, formatDate, etc.
├── prisma/
│   ├── schema.prisma        ← 7 models: User, Customer, Product,
│   │                           Order, OrderItem, AILog, + auth tables
│   ├── config.ts            ← Prisma 7 datasource config
│   └── seed.ts              ← 12 customers, 15 products, ~100 orders
└── types/index.ts           ← Shared TypeScript types
```

---

## Key Engineering Decisions

### React Server Components First

Data fetching happens server-side before anything reaches the browser. Client components handle only interactivity: animations, streaming AI, and real-time state.

Pages are marked `force-dynamic` to bypass Vercel's edge cache and ensure `router.refresh()` triggers a real server re-render.

### Prisma 7 Adapter Pattern

Prisma 7 removed the `url` field from `schema.prisma`. The datasource URL now lives in `prisma.config.ts` and is passed via a `PrismaPg` pool adapter.

The same adapter pattern is used in both the app (`lib/prisma.ts`) and the seed script (`prisma/seed.ts`).

### Streaming AI

All three AI surfaces use `ReadableStream` with a `getReader()` loop on the client.

Text accumulates in a `let` variable and is captured per chunk to avoid React compiler complaints about closure mutation.

The insights banner ties its `refreshKey` prop to the latest order's `createdAt` timestamp — a pure, stable value that changes only when new data exists.

### Client-Driven Simulation

The original design used Server-Sent Events and a Vercel cron job. Both were dropped for free-tier compatibility.

SSE connections drop at 10 seconds on Vercel Hobby, while crons are limited to once daily.

The final architecture uses `SimulatorProvider` to:

1. Poll `/api/simulate/cron` every 60 seconds.
2. Run the simulation tick.
3. Call `router.refresh()` to update server-rendered data.

### Shared Sidebar State

`SidebarProvider` lifts mobile open/close state above both `Sidebar` and `Topbar`, allowing the hamburger in the topbar to control the sidebar drawer without prop drilling or sibling communication hacks.

---

## Local Development

```bash
# Clone
git clone https://github.com/JonOnTheHub/nexus-dash.git
cd nexus-dash

# Install
npm install

# Environment
cp .env.example .env.local
# Fill in: DATABASE_URL, AUTH_SECRET, AUTH_URL, GROQ_API_KEY

# Database
npx prisma generate
npx prisma db push
npx prisma db seed

# Dev server
npm run dev
```

Open `http://localhost:3000` and log in with `admin@nexus.com`.

---

## Environment Variables

```bash
DATABASE_URL=       # PostgreSQL connection string (Neon recommended)
AUTH_SECRET=        # Random string — openssl rand -base64 32
AUTH_URL=           # http://localhost:3000 (dev) or production URL
GROQ_API_KEY=       # From console.groq.com
```

---

## Deployment

Nexus Dash is deployed on Vercel.

Add all four environment variables in the Vercel dashboard before deploying.

The build script runs `prisma generate` before `next build`:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

---

## Database Schema

Seven commerce/auth models are used across two domains.

### Auth

* `User`
* `Account`
* `Session`
* `VerificationToken`

These follow the NextAuth v5 standard.

### Commerce

* `Customer`
* `Product` — with `Category` enum
* `Order` — with `OrderStatus` enum
* `OrderItem`
* `AILog`

### Relations

* `Order` → `Customer` — many-to-one
* `Order` → `OrderItem` — one-to-many
* `OrderItem` → `Product` — many-to-one

---

## Built By

**Jon Osaghae** — fullstack developer specialising in AI integration and intelligent internal systems.

* [LinkedIn](https://linkedin.com/in/jon-osaghae)
* [GitHub Repository](https://github.com/JonOnTheHub/nexus-dash)
* [Live Demo](https://nexusdash-beta.vercel.app)
