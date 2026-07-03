# PIZI-EXACT — Next.js Frontend (1:1 Laravel Replica)

EXACT replica of pizi.in Laravel frontend in Next.js 14 (App Router + TypeScript + Tailwind).

## 🎨 Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** with EXACT Laravel colors (coral, ink, cream, Fraunces + Plus Jakarta Sans)
- **TanStack Query** for data fetching
- **Zustand** for auth state
- **Axios** with token interceptor
- **Sonner** for toasts

## 🔌 Backend

Connects to your existing Laravel backend at `https://pizi.in/api` — **Laravel code UNCHANGED**.

## 📦 Install

### Option 1: Fresh install

```cmd
cd C:\projects\pizi-platform\apps
xcopy /E /Y "C:\Users\YOU\Downloads\pizi-exact" "web\"
cd web
copy .env.local.example .env.local
npm install
npm run dev
```

### Option 2: Copy into existing apps/web

```cmd
:: Backup existing first
rename C:\projects\pizi-platform\apps\web web-old

:: Copy fresh
xcopy /E /Y "C:\Users\YOU\Downloads\pizi-exact" "C:\projects\pizi-platform\apps\web\"
cd C:\projects\pizi-platform\apps\web
copy .env.local.example .env.local
npm install
npm run dev
```

Open: http://localhost:3000

## 🔑 Test Credentials (live pizi.in DB)

- **Admin:** admin@pgfind.in / admin123
- **Owner:** owner@pgfind.in / owner123
- **Atul (Owner):** htggbp@gmail.com / [your password]

## 🌐 Routes (Full EXACT Laravel Replica)

### Public
- `/` — Homepage with hero + featured + cities + blogs
- `/search` — Property search with filters
- `/property/[slug]` — Property detail with lead form + WhatsApp
- `/city/[slug]` — City SEO landing
- `/locality/[slug]` — Locality SEO landing
- `/landmark/[slug]` — Landmark SEO landing
- `/landmarks` — All landmarks
- `/blog` & `/blog/[slug]` — Public blog
- `/about` `/contact` `/sitemap` — Static pages

### Auth
- `/login` — Password login
- `/login/otp` — OTP login send
- `/login/otp/verify` — OTP verify (auto-submits on 6 digits)
- `/register` — Password registration with role selector
- `/register/complete` — Post-OTP completion form

### Admin (full PG management)
- `/admin` — Dashboard with 8 stat cards + lead routing engine
- `/admin/properties` + `/admin/properties/new` — CRUD with assign-to-owner
- `/admin/leads` + `/admin/leads/new` — Lead management + assign telecaller
- `/admin/users` — User CRUD with role filter
- `/admin/wallets` — Owner wallets, adjust credits
- `/admin/pricing` — Lead pricing config
- `/admin/packages` — Credit packages CRUD
- `/admin/analytics` — KPIs + funnel
- `/admin/blogs` + `/admin/blogs/new` + `/admin/blogs/[id]` — Blog CRUD
- `/admin/field-tracker` — LIVE field exec tracking with auto-refresh 30s
- `/admin/pg-overview` — 6-gradient PG management dashboard
- `/admin/rooms` `/admin/tenants` `/admin/agreements` `/admin/rent` `/admin/complaints` — Platform-wide

### Owner
- `/owner` — Dashboard with welcome + stats + recent leads
- `/owner/properties` + `/owner/properties/new` + `/owner/properties/[id]` — Property CRUD (392-line form replicated)
- `/owner/leads` — 4 tabs (All/Hot/Affordable/Unlocked) + match score
- `/owner/wallet` — Balance + transactions
- `/owner/credits` — Package purchase (Razorpay flow)
- `/owner/rent` `/owner/tenants` `/owner/rooms` `/owner/complaints` — PG management
- `/owner/analytics` — Property performance + credit usage charts
- `/owner/blogs` — Blog CRUD

### Telecaller
- `/telecaller` — Dashboard with new leads + today's followups
- `/telecaller/leads` — Search + status filter
- `/telecaller/leads/[id]` — LIVE EDIT with debounced auto-save + matching properties

### Field Executive (PWA)
- `/field` — PWA dashboard with today's visits
- `/field/visits` — Filtered visits list
- `/field/visits/[id]` — GPS check-in + verification checklist + media upload

### SEO Manager
- `/seo` — Dashboard with stats
- `/seo/settings` + `/seo/settings/new` + `/seo/settings/[id]` — SEO page CRUD
- `/seo/blogs` — Full blog CRUD

### Shared
- `/notifications` — All notifications with mark-read
- `/leads/manual/new` — Manual lead form (admin/telecaller)

## 🎨 Design System (Laravel EXACT)

**Colors:**
- `coral.500` = `#ff6b5b` (primary)
- `coral.600` = `#ed4e3d` (hover)
- `ink.950` = `#0a1a30` (darkest)
- `ink.900` = `#0f2748` (sidebar bg DARK NAVY)
- `ink.800` = `#15355f`
- `cream` = `#fefcf6`
- Body bg = `#f6f5f1`

**Fonts:**
- Display: Fraunces (serif, italic accents)
- Body: Plus Jakarta Sans

**Sidebar:** DARK NAVY (`bg-ink-950 text-cream`) — exact Laravel `layouts/dashboard.blade.php`
**Active item:** `bg-cream/10 text-coral-500`

## 🛡️ Auth Flow

1. User logs in → `POST /api/auth/login` → returns `{ user, token }`
2. Token stored in `localStorage.pizi_token`
3. Axios interceptor adds `Authorization: Bearer <token>` to every request
4. 401 → auto-redirect to `/login`

## 📞 Backend API Required Endpoints

Your existing Laravel API at `pizi-laravel-api.zip` should provide all these. Key ones:
- `POST /api/auth/login` `/api/auth/register` `/api/auth/otp/send` `/api/auth/otp/verify` `/api/auth/me`
- `GET /api/public/home` `/api/public/search` `/api/public/properties/{slug}` `/api/public/city/{slug}` `/api/public/blogs`
- `GET /api/admin/dashboard` `/api/admin/properties` `/api/admin/leads` `/api/admin/users` `/api/admin/field-tracker` etc.
- `GET /api/owner/dashboard` `/api/owner/properties` `/api/owner/leads` `/api/owner/wallet` etc.
- `GET /api/telecaller/dashboard` `/api/telecaller/leads` `/api/field/visits` etc.

## ⚠️ Important Notes

1. **Laravel backend stays UNCHANGED** — only API endpoints needed (already in `pizi-laravel-api.zip`)
2. **Storage URL:** Images served from `https://pizi.in/storage/<path>` (configurable)
3. **Field PWA:** Add to home screen on mobile for app-like experience
4. **Razorpay:** Loaded via `<Script>` in root layout, available globally as `window.Razorpay`

## 🚀 Production Build

```cmd
npm run build
npm start
```

Or deploy to Vercel:
```cmd
npm install -g vercel
vercel
```

Set env vars on Vercel:
- `NEXT_PUBLIC_API_URL=https://pizi.in/api`
- `NEXT_PUBLIC_STORAGE_URL=https://pizi.in/storage`
- `NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxx`

---

**Built by Atul / Help Together Media** — EXACT 1:1 Laravel → Next.js migration. All 95 blade files replicated.
