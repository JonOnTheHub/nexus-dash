# Nexus Dash

An AI-powered e-commerce operations dashboard built as a production-grade MVP. Nexus Dash combines real-time commerce data, three distinct AI surfaces, a live simulation engine, and a cyberpunk-inspired design system — built with Next.js 16 App Router and a full backend stack.

> **Note:** The live demo is currently offline because the Vercel Hobby plan's free function execution limits were exhausted by the simulation engine. The codebase is fully functional. Clone and run it locally, or deploy it with a paid Vercel plan to restore live operation.

**Demo credentials (local):**

* Email: `admin@nexus.com`
* Password: None required in MVP mode

---

## What It Does

Nexus Dash gives e-commerce operators a single interface to:

* Monitor revenue and business metrics
* Manage and track orders
* Monitor product inventory
* Search and analyze customers
* Get AI-generated operational insights
* Chat with an AI assistant using live store context
* Watch the dashboard update through a background simulation engine

The simulation engine continuously generates realistic e-commerce activity, including orders, price changes, new customers, and inventory restocks. This keeps the dashboard live and gives the AI current store data to work with.

---

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Framework      | Next.js 16 (App Router, React Server Components)    |
| Frontend       | React 19, Tailwind CSS v4, Framer Motion 12         |
| UI Primitives  | shadcn/ui (Radix Nova), Phosphor Icons, Recharts    |
| Typography     | Orbitron (display), Geist (body), Geist Mono (data) |
| AI             | Groq SDK — `openai/gpt-oss-120b`                    |
| Authentication | NextAuth v5 — JWT strategy, credentials provider    |
| Database       | PostgreSQL via Neon (serverless)                    |
| ORM            | Prisma 7 with PrismaPg driver adapter               |
| Deployment     | Vercel                                              |

---

## Features

### Dashboard Pages

#### Overview

* Four animated metric cards:

  * Revenue
  * Orders
  * Customers
  * Low stock
* 30-day revenue area chart
* Recent orders table
* AI insights banner
* Real-time updates from the simulation engine

#### Orders

* Filter orders by status
* Paginated order list
* Expandable order rows
* View line items for each order

#### Products

* Filter by category
* Animated inventory level bars
* Low-stock warnings
* Order count per SKU

#### Customers

* Live customer search
* Spend visualization
* Customers ranked by total spend
* Customer join dates

#### AI Assistant

* Full-page AI chat interface
* Suggestion chips
* Conversation history
* Streaming responses
* Transcript export to `.txt`

---

## AI Integrations

Nexus Dash uses Groq with `openai/gpt-oss-120b` across three distinct AI surfaces.

### 1. AI Insights Banner

Displayed across the dashboard.

On each dashboard load, Groq analyzes live store metrics and generates:

* A concise two-sentence business insight
* An actionable recommendation

The insight automatically refreshes after each simulator tick.

### 2. Chat Drawer

A floating AI assistant accessible from any dashboard page.

The assistant receives contextual store information including:

* Revenue changes
* Top products and prices
* Low-stock products
* Order status breakdown
* Top 10 customers by spend
* Relevant operational metrics

The system prompt enforces strict accuracy rules so the assistant does not fabricate store data.

### 3. Full AI Chat Page

A dedicated full-page chat experience using the same AI engine.

Includes:

* Conversation history
* Eight suggestion chips
* Streaming responses
* Transcript export to `.txt`
* Full store context

---

## Live Simulation Engine

Nexus Dash includes a background simulation engine that generates realistic e-commerce activity every 60 seconds.

### Simulation Behavior

| Event               | Behavior                                               |
| ------------------- | ------------------------------------------------------ |
| Orders              | 0 orders (15%), 1 order (60%), 2 orders (25%) per tick |
| Items               | 1–2 products per order                                 |
| Quantity            | Almost always quantity 1                               |
| Price changes       | ±2% on a random product per tick                       |
| Price limit         | Clamped to ±15% of the original price                  |
| New customers       | 15% chance per tick                                    |
| Customer generation | Name and city pools with email deduplication           |
| Restocking          | 25% chance when a product reaches ≤5 units             |
| Restock quantity    | 10–25 units                                            |

### Why Client-Driven?

The original architecture used Server-Sent Events and a Vercel cron job. Both approaches were removed for free-tier compatibility:

* Vercel Hobby SSE connections can drop after 10 seconds.
* Vercel Hobby cron jobs are limited to once per day.

The final implementation uses client-driven polling:

```text
SimulatorProvider
       │
       │ every 60 seconds
       ▼
/api/simulate/cron
       │
       ▼
Simulation Engine
       │
       ▼
Database Update
       │
       ▼
router.refresh()
```

This keeps the dashboard compatible with the Vercel deployment model while maintaining live behavior.

---

## Design System

Nexus Dash uses a custom cyberpunk visual system built around Tailwind CSS v4 and CSS custom properties.

### Visual Language

* **Primary accent:** Neon orange `#FF5F1F`
* **OKLCH accent:** `oklch(0.65 0.22 34)`
* **Fluted glass:** Repeating vertical gradients combined with `backdrop-filter: blur`
* **Scanlines:** Fixed `body::before` CRT texture at 1.8% opacity
* **Theme:** Dark mode forced via `class="dark"` on `<html>`
* **Animations:** Framer Motion spring physics
* **House spring curve:** `stiffness: 120, damping: 18`
* **Navigation:** Shared `layoutId` indicator morphs between active states

---

## Architecture

```text
nexus-dash/
├── app/
│   ├── (auth)/
│   │   └──              # Login shell, separate layout tree
│   │
│   ├── (dashboard)/
│   │   ├── page.tsx     # Overview (force-dynamic, SSR)
│   │   ├── orders/
│   │   ├── products/
│   │   ├── customers/
│   │   └── ai-assistant/
│   │
│   └── api/
│       ├── auth/        # NextAuth handlers
│       ├── ai/
│       │   ├── chat/    # Groq chat completions
│       │   └── insights/# Groq insights banner
│       └── simulate/
│           └── cron/    # Simulation tick endpoint
│
├── components/
│   ├── dashboard/
│   │   ├── MetricCard
│   │   ├── RevenueChart
│   │   ├── OrdersTable
│   │   ├── ProductsTable
│   │   ├── CustomersTable
│   │   ├── AIInsightsBanner
│   │   ├── Sidebar
│   │   └── Topbar
│   │
│   ├── ai/
│   │   ├── ChatDrawer
│   │   ├── ChatFull
│   │   └── ChatMessage
│   │
│   └── providers/
│       ├── SimulatorProvider
│       ├── SidebarProvider
│       └── PageTransition
│
├── lib/
│   ├── data.ts          # Database queries / data access layer
│   ├── simulator.ts     # Simulation engine
│   ├── groq.ts          # Groq singleton
│   ├── prisma.ts        # Prisma singleton + PrismaPg adapter
│   ├── auth.ts          # NextAuth configuration
│   └── utils.ts         # Shared utilities
│
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── config.ts        # Prisma 7 datasource configuration
│   └── seed.ts          # Database seed data
│
├── types/
│   └── index.ts         # Shared TypeScript types
│
├── .env.example
├── next.config.ts
├── package.json
└── README.md
```

---

## Key Engineering Decisions

### React Server Components First

Data fetching happens server-side before data reaches the browser.

Client components are responsible only for interactive behavior such as:

* Animations
* AI responses
* Real-time state
* User interactions

Dashboard pages are marked `force-dynamic` to bypass Vercel's edge cache. This ensures that `router.refresh()` triggers a fresh server render with current database data.

### Prisma 7 Adapter Pattern

Prisma 7 removed the `url` field from `schema.prisma`.

The database connection is now configured through `prisma.config.ts` and passed to Prisma through a `PrismaPg` pool adapter.

The same adapter pattern is used in:

* `lib/prisma.ts`
* `prisma/seed.ts`

### AI Model Configuration

Nexus Dash uses `openai/gpt-oss-120b` through Groq.

The insights endpoint uses:

```text
stream: false
max_tokens: 1024
```

The larger token budget is intentional because the model is a reasoning model. Earlier attempts using `max_tokens: 120` resulted in `finish_reason: length` with empty `content` because the model exhausted its token budget during reasoning before producing the final response.

### Client-Driven Simulation

The initial implementation used:

* Server-Sent Events
* Vercel cron jobs

Both were removed in favor of client-driven polling.

`SimulatorProvider` polls `/api/simulate/cron` every 60 seconds, executes a simulation tick, and calls `router.refresh()` to update the dashboard.

### Shared Sidebar State

`SidebarProvider` manages mobile sidebar state above both the `Sidebar` and `Topbar`.

This allows the hamburger button in the topbar to control the sidebar drawer without prop drilling.

### `AUTH_URL` Development Configuration

During local development, `.env.local` must contain:

```env
AUTH_URL=http://localhost:3000
```

If `AUTH_URL` points to the production deployment, local requests can silently redirect to the deployed Vercel application. This can make local debugging appear as though the production build is running.

---

## Getting Started

### Prerequisites

You'll need:

* Node.js
* PostgreSQL database
* Groq API key

Neon is recommended for PostgreSQL.

### 1. Clone the Repository

```bash
git clone https://github.com/JonOnTheHub/nexus-dash.git
cd nexus-dash
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then configure the required variables:

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=http://localhost:3000
GROQ_API_KEY=
```

### 4. Initialize the Database

Generate the Prisma client:

```bash
npx prisma generate
```

Push the schema to your database:

```bash
npx prisma db push
```

Seed the database:

```bash
npx prisma db seed
```

The seed creates approximately:

* 12 customers
* 15 products
* 100 orders

### 5. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Log in using:

```text
admin@nexus.com
```

No password is required in MVP mode.

---

## Environment Variables

| Variable       | Description                    |
| -------------- | ------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string   |
| `AUTH_SECRET`  | Random secret used by NextAuth |
| `AUTH_URL`     | Application URL                |
| `GROQ_API_KEY` | Groq API key                   |

Example:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="your-random-secret"
AUTH_URL="http://localhost:3000"
GROQ_API_KEY="gsk_..."
```

Generate an `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

> **Important:** Use `http://localhost:3000` for `AUTH_URL` during local development. Use your production URL when deploying.

---

## Deployment

Nexus Dash is deployable on Vercel.

Before deploying, configure all required environment variables in the Vercel project settings.

The production build runs Prisma generation before the Next.js build:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### Vercel Hobby Consideration

The simulation engine uses client-driven polling. Sustained traffic can exhaust the function execution quota on Vercel Hobby.

For a persistent live deployment, use either:

* Vercel Pro
* A self-hosted Node.js environment

---

## Database Schema

The database contains two main domains: authentication and commerce.

### Authentication

NextAuth models:

* `User`
* `Account`
* `Session`
* `VerificationToken`

### Commerce

Commerce models:

* `Customer`
* `Product`
* `Order`
* `OrderItem`
* `AILog`

Enums include:

* `Category`
* `OrderStatus`

### Relationships

```text
Customer
   │
   └──< Order
          │
          └──< OrderItem >── Product
```

Specifically:

* `Order` → `Customer`: many-to-one
* `Order` → `OrderItem`: one-to-many
* `OrderItem` → `Product`: many-to-one

---

## Project Structure

| Directory     | Purpose                                                     |
| ------------- | ----------------------------------------------------------- |
| `app/`        | Routes, layouts, pages, and API endpoints                   |
| `components/` | Dashboard, AI, and shared UI components                     |
| `lib/`        | Database, authentication, AI, simulation, and utility logic |
| `prisma/`     | Schema, configuration, and seed data                        |
| `types/`      | Shared TypeScript types                                     |

---

## License

This project is provided as-is for demonstration and development purposes.
