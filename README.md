# OzSheepTight - Premium Baby Products E-commerce

A modern e-commerce platform for baby products with Apple/Tesla-inspired design.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes + Supabase
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Animations:** Framer Motion
- **Deployment:** Vercel-ready

## Features

### Public Store
- 🏠 Homepage with hero, featured products, categories
- 🛍️ Product listing with filters (category, price, search)
- 📦 Product detail pages
- 🛒 Shopping cart (localStorage)
- 🔍 Search functionality

### Admin Panel
- 📊 Dashboard with stats (products, orders, revenue)
- 📦 Product management (CRUD)
- 📁 Category management (CRUD)
- 📋 Order management

## Getting Started

### 1. Clone & Install

```bash
cd ozsheeptight
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the migration in Supabase SQL Editor:
   - Go to SQL Editor
   - Copy/paste contents of `supabase/migrations/001_initial_schema.sql`
   - Execute

3. Get your credentials:
   - Go to Settings > API
   - Copy `Project URL` and `anon public` key
   - Copy `service_role` key (for admin operations)

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ozsheeptight/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Root layout
│   │   ├── products/             # Product listing
│   │   ├── product/[id]/         # Product detail
│   │   ├── category/[id]/        # Category page
│   │   ├── cart/                 # Shopping cart
│   │   ├── api/                  # API routes
│   │   └── admin/                # Admin panel
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   ├── layout/               # Header, Footer, Sidebar
│   │   └── home/                 # Homepage components
│   └── lib/
│       ├── supabase/             # Supabase clients
│       ├── types/                # TypeScript types
│       └── utils.ts              # Utility functions
├── supabase/
│   └── migrations/               # Database migrations
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | List all products |
| `/api/products` | POST | Create product |
| `/api/products/[id]` | GET | Get single product |
| `/api/products/[id]` | PUT | Update product |
| `/api/products/[id]` | DELETE | Delete product |
| `/api/categories` | GET | List all categories |
| `/api/categories` | POST | Create category |
| `/api/orders` | GET | List all orders |
| `/api/orders` | POST | Create order |

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Design

- 🌙 Dark mode first
- ✨ Glass morphism effects
- 🎨 Premium color palette
- 📱 Fully responsive
- ⚡ Smooth Framer Motion animations
- 🍎 Apple/Tesla-inspired aesthetics

## License

MIT
