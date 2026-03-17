# OzSheepTight - Project Documentation

> Premium baby products e-commerce platform with Apple/Tesla-inspired design

---

## 🌐 Live URLs

| Platform | URL |
|----------|-----|
| **Production** | https://ozsheeptight.vercel.app |
| **GitHub** | https://github.com/paristran/ozsheeptight |
| **Supabase** | Needs setup (see below) |

---

## 📋 Project Overview

**OzSheepTight** is a modern e-commerce platform for baby products, built with a focus on premium aesthetics and user experience. The design follows Apple and Tesla's minimalist, clean approach with glass morphism effects and smooth animations.

### Target Market
- Australian parents looking for premium baby products
- Focus on quality, safety, and aesthetic appeal
- Products include: blankets, clothing, toys, nursery items, feeding accessories

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **UI Components:** Custom components with Radix UI primitives

### Backend
- **API:** Next.js API Routes (serverless)
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth (ready to enable)
- **Storage:** Supabase Storage (for product images)
- **ORM:** Direct Supabase client queries

### Deployment
- **Hosting:** Vercel (auto-deploys from GitHub main branch)
- **Database Hosting:** Supabase Cloud
- **CI/CD:** Vercel automatic deployments

---

## 📁 Project Structure

```
ozsheeptight/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   │
│   │   ├── products/             # Product listing
│   │   │   └── page.tsx
│   │   │
│   │   ├── product/[id]/         # Product detail
│   │   │   └── page.tsx
│   │   │
│   │   ├── category/[id]/        # Category filtered products
│   │   │   └── page.tsx
│   │   │
│   │   ├── cart/                 # Shopping cart
│   │   │   └── page.tsx
│   │   │
│   │   ├── api/                  # API routes
│   │   │   ├── products/
│   │   │   │   ├── route.ts      # GET list, POST create
│   │   │   │   └── [id]/route.ts # GET, PUT, DELETE single
│   │   │   ├── categories/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── orders/
│   │   │       └── route.ts
│   │   │
│   │   └── admin/                # Admin panel
│   │       ├── layout.tsx        # Admin layout with sidebar
│   │       ├── page.tsx          # Dashboard
│   │       ├── products/
│   │       │   ├── page.tsx      # Products list
│   │       │   └── new/page.tsx  # Add product form
│   │       ├── categories/
│   │       │   └── page.tsx      # Categories management
│   │       └── orders/
│   │           └── page.tsx      # Orders management
│   │
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── badge.tsx
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   ├── Header.tsx        # Public site header
│   │   │   ├── Footer.tsx        # Public site footer
│   │   │   └── AdminSidebar.tsx  # Admin navigation
│   │   │
│   │   └── home/                 # Homepage components
│   │       ├── Hero.tsx          # Hero section
│   │       ├── FeaturedProducts.tsx
│   │       └── Categories.tsx
│   │
│   └── lib/
│       ├── supabase/             # Supabase configuration
│       │   ├── client.ts         # Browser client
│       │   ├── server.ts         # Server client
│       │   └── admin.ts          # Admin/service role client
│       │
│       ├── types/
│       │   └── database.ts       # TypeScript types
│       │
│       └── utils.ts              # Utility functions
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema + seed data
│
├── .env.example                   # Environment variables template
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── README.md
```

---

## 🗄️ Database Schema

### Tables

#### `categories`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Category name |
| slug | VARCHAR(255) | URL-friendly identifier (unique) |
| description | TEXT | Category description |
| image_url | TEXT | Category image |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### `products`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Product name |
| slug | VARCHAR(255) | URL-friendly identifier (unique) |
| description | TEXT | Product description |
| price | DECIMAL(10,2) | Current price |
| compare_at_price | DECIMAL(10,2) | Original price (for sales) |
| category_id | UUID | Foreign key to categories |
| image_url | TEXT | Main product image |
| images | TEXT[] | Array of additional images |
| stock_quantity | INTEGER | Available stock |
| featured | BOOLEAN | Show on homepage |
| active | BOOLEAN | Product is visible |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### `orders`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| customer_email | VARCHAR(255) | Customer email |
| customer_name | VARCHAR(255) | Customer name |
| customer_phone | VARCHAR(50) | Customer phone |
| total | DECIMAL(10,2) | Order total |
| status | VARCHAR(50) | pending/processing/shipped/delivered/cancelled |
| shipping_address | JSONB | Shipping details |
| notes | TEXT | Order notes |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### `order_items`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Foreign key to orders |
| product_id | UUID | Foreign key to products |
| quantity | INTEGER | Quantity ordered |
| price | DECIMAL(10,2) | Price at time of order |

---

## 🎨 Design System

### Color Palette
- **Primary:** Gradient purple-blue (#8B5CF6 → #3B82F6)
- **Background:** Dark (#0A0A0B, #111113)
- **Text:** White/Gray variants
- **Accents:** Green (success), Red (error), Amber (warning)

### Typography
- Clean, modern sans-serif
- Large headings with generous whitespace
- Hierarchical sizing (H1-H6)

### Effects
- Glass morphism (backdrop-blur, semi-transparent backgrounds)
- Smooth Framer Motion animations
- Hover effects on cards and buttons
- Premium shadow effects

### Components
- **Cards:** Glass effect with border gradients
- **Buttons:** Rounded, gradient backgrounds, hover animations
- **Inputs:** Clean, dark themed, focus states
- **Badges:** Pill-shaped, color-coded by type

---

## 🔌 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create new product |
| GET | `/api/products/[id]` | Get single product |
| PUT | `/api/products/[id]` | Update product |
| DELETE | `/api/products/[id]` | Delete product |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create new category |
| GET | `/api/categories/[id]` | Get single category |
| PUT | `/api/categories/[id]` | Update category |
| DELETE | `/api/categories/[id]` | Delete category |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| POST | `/api/orders` | Create new order |

---

## ⚙️ Environment Variables

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or production URL
```

### Getting Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Create new project or select existing
3. Navigate to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🚀 Deployment Guide

### Initial Setup

1. **Clone & Install**
   ```bash
   cd /Users/paris/.openclaw/workspace/ozsheeptight
   npm install
   ```

2. **Create Supabase Project**
   - Go to supabase.com
   - Create new project: "OzSheepTight"
   - Wait for project to be provisioned

3. **Run Database Migration**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and execute
   - This creates tables + inserts sample data

4. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

5. **Run Locally**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

### Deploy to Vercel

1. **Push to GitHub** (already done)
   - Repo: https://github.com/paristran/ozsheeptight

2. **Import in Vercel**
   - Go to vercel.com
   - Import project from GitHub
   - Select `paristran/ozsheeptight`

3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all 3 Supabase variables
   - Redeploy

4. **Done!**
   - Production URL: https://ozsheeptight.vercel.app

---

## 📊 Features

### Public Store
- ✅ Homepage with hero, featured products, categories
- ✅ Product listing with filters (category, price, search)
- ✅ Product detail pages with images, pricing, add to cart
- ✅ Category filtering
- ✅ Shopping cart (localStorage-based)
- ✅ Responsive design (mobile-first)
- ✅ Search functionality
- ✅ Smooth animations

### Admin Panel
- ✅ Dashboard with stats (products, categories, orders, revenue)
- ✅ Product management (list, create, edit, delete)
- ✅ Category management (list, create, edit, delete)
- ✅ Order management (list, view details)
- ✅ Clean admin UI with sidebar navigation

### Still TODO
- ⬜ User authentication (Supabase Auth ready)
- ⬜ Stripe payment integration
- ⬜ Order checkout flow
- ⬜ Email notifications
- ⬜ Product image upload (Supabase Storage)
- ⬜ Inventory management
- ⬜ Order status updates
- ⬜ Customer accounts

---

## 📝 Development Notes

### Known Issues
- TypeScript strict mode disabled (`@ts-nocheck`) on some files due to Supabase type inference
- Cart is localStorage-based (not persisted to database)
- No authentication yet (admin is publicly accessible)

### Future Improvements
1. Add user authentication with Supabase Auth
2. Integrate Stripe for payments
3. Implement proper checkout flow
4. Add Supabase Storage for image uploads
5. Email notifications via Resend
6. Order tracking for customers
7. Inventory alerts
8. Analytics dashboard
9. SEO optimization
10. Performance optimization (image CDN, caching)

---

## 👤 Project Info

- **Created:** March 16, 2026
- **Owner:** Frank Tran (paristran GitHub account)
- **Location:** `/Users/paris/.openclaw/workspace/ozsheeptight`
- **Purpose:** Premium baby products e-commerce for Australian market

---

## 📞 Quick Commands

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run start        # Start production server

# Deploy
vercel --prod        # Deploy to Vercel

# Database
# Run migrations in Supabase SQL Editor

# Git
git add .
git commit -m "Your message"
git push origin main
```

---

*Last updated: March 16, 2026*
