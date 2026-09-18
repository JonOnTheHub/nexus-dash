# Nexus Dash

An AI-powered e-commerce operations dashboard built as a production-grade MVP. Real-time data, three distinct AI surfaces, a live simulation engine, and a cyberpunk design system — built in **Next.js 16 App Router** with a full backend stack.

> **Note:** The live demo is currently offline — the Vercel Hobby plan's free function execution limits were exhausted by the simulation engine. The codebase is fully functional; clone and run locally or deploy with a paid Vercel plan to restore live operation.

**Demo credentials (local):**

* Email: `admin@nexus.com`
* Password: No password required in MVP mode

---

## What It Does

Nexus Dash gives e-commerce operators a single interface to monitor revenue, manage orders, track inventory, and get AI-generated insights — all updating in real time.

A background simulation engine continuously generates orders, adjusts prices, and onboards new customers, keeping the dashboard live and the AI contextually aware.

---

## Tech Stack

| Layer             | Technology                                          |
| ----------------- | --------------------------------------------------- |
| **Framework**     | Next.js 16 (App Router, React Server Components)    |
| **Frontend**      | React 19, Tailwind CSS v4, Framer Motion 12         |
| **UI Primitives** | shadcn/ui (Radix Nova), Phosphor Icons, Recharts    |
| **Typography**    | Orbitron (display), Geist (body), Geist Mono (data) |
| **AI**            | Groq SDK — `openai/gpt-oss-120b`                    |
| **Auth**          | NextAuth v5 — JWT strategy, credentials provider    |
| **Database**      | PostgreSQL via Neon (serverless)                    |
| **ORM**           | Prisma 7 with PrismaPg driver adapter               |
| **Deployment**    | Vercel                                              |

---

## Features

### Dashboard Pages

* **Overview**

  * 4 animated metric cards: revenue, orders, customers, low stock
  * 30-day revenue area chart
  * Recent orders table
  * AI insights banner

* **Orders**

  * Filterable by status
  * Paginated
  * Expandable rows showing line items per order

* **Products**

  * Category filter
  * Animated stock-level bars
  * Low-stock warnings
  * Order count per SKU

* **Customers**

  * Live search
  * Spend bars
  * Ranked by total spend
  * Join date

* **AI Assistant**

  * Full-page chat
  * Suggestion chips
  * Transcript export
  * Streaming responses

---

## AI Surfaces

All AI features use **Groq — `openai/gpt-oss-120b`** and stream responses via `ReadableStream`.

### 1. Insights Banner

On every dashboard load, Groq analyzes live store metrics and streams:

* A 2-sentence insight
* An actionable recommendation

The banner refreshes automatically on each data tick.

### 2. Chat Drawer

A floating assistant accessible from any page.

Features include:

* Conversation history
* Full store context
* Revenue data
* Top products with prices
* Low-stock products by name
* Order breakdown
* Customer counts
* Structured list-based responses instead of walls of text

### 3. Full Chat Page

The full-page AI assistant uses the same engine and includes:

* 8 suggestion chips
* Streaming responses
* Conversation history
* Transcript export

---

## Live Simulation Engine

A background engine generates realistic e-commerce activity every **60 seconds**.

### Order Generation

Each simulation tick generates:

* **0 orders:** 15% chance
* **1 order:** 60% chance
* **2 orders:** 25% chance

Orders contain:

* 1–2 products
* Almost always quantity 1

### Price Variance

Each tick:

* Randomly selects a product
* Adjusts its price by ±2%
* Clamps the price to ±15% of its original value

### New Customers

There is a **15% chance per tick** of generating a new customer.

Customers are generated from:

* Name pools
* City pools

Emails are deduplicated to prevent duplicate customers.

### Restocking

When a product reaches **5 units or fewer**, there is a **25% chance** of restocking.

Each restock adds:

* 10–25 units

### Client-Driven Simulation

The simulation is client-driven through 60-second polling.

`SimulatorProvider`:

1. Calls `/api/simulate/cron`
2. Runs the simulation tick
3. Calls `router.refresh()`
4. Updates the dashboard with fresh server-rendered data

---

## Design System

Nexus Dash uses a custom cyberpunk aesthetic built with Tailwind CSS v4 custom properties.

### Accent

Neon orange:

```text
#FF5F1F
```

Equivalent design token:

```text
oklch(0.65 0.22 34)
```

### Fluted Glass

The signature surface material uses:

* Repeating vertical gradients
* `backdrop-filter: blur`

### Scanline Overlay

A fixed `body::before` pseudo-element provides a CRT-style scanline texture at **1.8% opacity**.

### Dark Mode

Dark mode is forced by hardcoding:

```html
<html class="dark">
```

There is no theme toggle.

### Motion

Framer Motion uses spring physics with the house curve:

```text
stiffness: 120
damping: 18
```

### Navigation Indicator

The active navigation state uses a shared Framer Motion `layoutId` element to morph the indicator between navigation items.

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
└── types/
    └── index.ts             ← Shared TypeScript types
```

---

## Key Engineering Decisions

### React Server Components First

Data fetching happens server-side before anything reaches the browser.

Client components handle only:

* Interactivity
* Animations
* Streaming AI
* Real-time state

Pages are marked `force-dynamic` to bypass Vercel's edge cache and ensure `router.refresh()` triggers a real server re-render.

### Prisma 7 Adapter Pattern

Prisma 7 removed the `url` field from `schema.prisma`.

The datasource URL now lives in:

```text
prisma.config.ts
```

and is passed through a `PrismaPg` pool adapter.

The same adapter pattern is used in:

* `lib/prisma.ts`
* `prisma/seed.ts`

### Streaming AI

All three AI surfaces use:

```text
ReadableStream
```

with a `getReader()` loop on the client.

Text accumulates in a `let` variable and is captured per chunk to avoid React Compiler complaints about closure mutation.

The insights banner ties its `refreshKey` prop to the latest order's `createdAt` timestamp — a pure, stable value that changes only when new data exists.

### Client-Driven Simulation

The original design used:

* Server-Sent Events
* A Vercel cron job

Both were dropped because:

* SSE connections drop at 10s on Vercel Hobby
* Vercel Hobby crons are limited to once daily

The final architecture uses:

```text
SimulatorProvider
        │
        ▼
60-second polling
        │
        ▼
/api/simulate/cron
        │
        ▼
Simulation tick
        │
        ▼
router.refresh()
```

### Shared Sidebar State

`SidebarProvider` lifts mobile open/close state above both `Sidebar` and `Topbar`.

This allows the hamburger button in the topbar to control the sidebar drawer without:

* Prop drilling
* Sibling communication hacks

---

## Local Development

### 1. Clone

```bash
git clone https://github.com/JonOnTheHub/nexus-dash.git
cd nexus-dash
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then fill in:

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=
GROQ_API_KEY=
```

### 4. Set Up the Database

Generate the Prisma client:

```bash
npx prisma generate
```

Push the schema:

```bash
npx prisma db push
```

Seed the database:

```bash
npx prisma db seed
```

### 5. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Log in with:

```text
admin@nexus.com
```

No password is required in MVP mode.

---

## Environment Variables

Create a `.env.local` file with the following:

```env
DATABASE_URL=       # PostgreSQL connection string (Neon recommended)
AUTH_SECRET=        # Random string — openssl rand -base64 32
AUTH_URL=           # http://localhost:3000 (dev) or production URL
GROQ_API_KEY=       # From console.groq.com
```

### Variable Reference

| Variable       | Description                  |
| -------------- | ---------------------------- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET`  | Secret used by NextAuth      |
| `AUTH_URL`     | Application URL              |
| `GROQ_API_KEY` | Groq API authentication key  |

---

## Deployment

Nexus Dash is deployable on **Vercel**.

Add all four environment variables to the Vercel project before deploying.

The build script runs Prisma generation before the Next.js build:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### Free Tier Note

The simulation engine uses client-driven polling.

On Vercel Hobby, sustained traffic can exhaust the included function execution quota.

For a persistent live demo, use:

* **Vercel Pro**, or
* A self-hosted Node.js environment

---

## Database Schema

Nexus Dash contains **7 commerce/auth models across two domains**, with the authentication domain using the standard NextAuth model set.

### Auth

* `User`
* `Account`
* `Session`
* `VerificationToken`

### Commerce

* `Customer`
* `Product`
* `Order`
* `OrderItem`
* `AILog`

### Enums

**Product categories:**

```text
Category
```

**Order statuses:**

```text
OrderStatus
```

### Relations

```text
Order
  │
  ├── Customer
  │
  └── OrderItem
        │
        └── Product
```

Specifically:

* `Order` → `Customer`: many-to-one
* `Order` → `OrderItem`: one-to-many
* `OrderItem` → `Product`: many-to-one

---

## Project Highlights

Nexus Dash combines:

* ⚡ Next.js 16 App Router
* ⚛️ React Server Components
* 🧠 Groq-powered AI
* 📡 Streaming AI responses
* 📊 Real-time dashboard analytics
* 🛒 E-commerce simulation
* 🗄️ PostgreSQL + Prisma 7
* 🔐 NextAuth v5 authentication
* 🎨 Custom cyberpunk design system
* 🌀 Framer Motion animations
* ☁️ Vercel deployment

The result is a production-oriented e-commerce operations dashboard that combines live business data, autonomous simulation, and contextual AI assistance in a single interface.
