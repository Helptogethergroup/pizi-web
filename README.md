# 🏠 PIZI Platform — Node.js + Next.js

**Production-grade PG aggregator platform**, ported from Laravel to modern stack.

```
Backend:  NestJS + Prisma + MySQL + Redis + JWT
Frontend: Next.js 14 + TypeScript + Tailwind + shadcn/ui
Monorepo: Turborepo + pnpm
```

---

## 📁 Project Structure

```
pizi-platform/
├── apps/
│   ├── api/                     # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # 25+ tables (Users, Properties, Tenants, Rent, etc.)
│   │   │   └── seed.ts          # Default admin/owner users
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── common/          # Guards, decorators, filters
│   │       └── modules/         # auth, properties, tenants, rent, etc.
│   └── web/                     # Next.js frontend
│       ├── src/
│       │   ├── app/             # App Router pages
│       │   ├── components/      # UI components
│       │   └── lib/             # api client, auth store
│       └── public/
├── packages/                    # Shared packages
├── docker-compose.yml           # MySQL + Redis + Mailhog
├── turbo.json                   # Monorepo config
└── package.json
```

---

## 🚀 QUICK START

### Prerequisites
```bash
# Install Node.js 20+
node -v  # should show v20.x.x

# Install pnpm globally
npm install -g pnpm

# Install Docker Desktop (for local MySQL + Redis)
# Download from: https://www.docker.com/products/docker-desktop
```

### Step 1: Clone & Install
```bash
cd pizi-platform
pnpm install
```

### Step 2: Start Local Services (MySQL + Redis)
```bash
docker-compose up -d

# Verify:
docker ps
# Should show: pizi-mysql, pizi-redis, pizi-mailhog
```

### Step 3: Setup Backend
```bash
cd apps/api

# Copy env file
cp .env.example .env

# Edit .env if needed (defaults work for local)
# DATABASE_URL is preset to local Docker MySQL

# Generate Prisma client
pnpm prisma generate

# Push schema to database (creates all tables)
pnpm prisma db push

# Seed initial data
pnpm prisma db seed

# Start backend
pnpm dev
```

**Backend runs at:** http://localhost:4000
**Swagger docs:** http://localhost:4000/docs

### Step 4: Setup Frontend
```bash
# In NEW terminal window:
cd apps/web

# Copy env file
cp .env.example .env

# Start frontend
pnpm dev
```

**Frontend runs at:** http://localhost:3000

---

## 🔐 Default Login Credentials (After Seed)

```
ADMIN:
  Email: admin@pizi.in
  Password: admin123

OWNER:
  Email: owner@pizi.in
  Password: owner123
```

---

## 🗄️ MIGRATING DATA FROM HOSTINGER LARAVEL

### Option A: Direct Connection (Easiest)

Edit `apps/api/.env`:

```env
# Replace with your Hostinger credentials
DATABASE_URL="mysql://u112235086_findpizi:YOUR_PASSWORD@srv-db.hstgr.io:3306/u112235086_findpizi"
```

**In Hostinger panel:**
1. Go to **Databases** → Click your DB
2. Find **Remote MySQL** section
3. Add your **local IP** to allowlist (whatsmyip.com)
4. Save

**Then run:**
```bash
cd apps/api
pnpm prisma db pull   # Reads schema from Hostinger
pnpm prisma generate
```

### Option B: Export/Import (Safer)

```bash
# 1. From Hostinger phpMyAdmin → Export → Quick → SQL → Go

# 2. Import into local Docker MySQL:
docker exec -i pizi-mysql mysql -uroot -ppizi_root_2026 pizi_db < ~/Downloads/u112235086_findpizi.sql

# 3. Run Prisma introspect
cd apps/api
pnpm prisma db pull
pnpm prisma generate
```

---

## 📡 API ENDPOINTS

### Auth
```
POST   /api/v1/auth/register      Register new user
POST   /api/v1/auth/login         Login
POST   /api/v1/auth/refresh       Refresh access token
POST   /api/v1/auth/logout        Logout
GET    /api/v1/auth/me            Get current user
```

### Properties
```
GET    /api/v1/properties         List properties (public)
GET    /api/v1/properties/:id     Property detail (public)
POST   /api/v1/properties         Create (owner/admin)
PATCH  /api/v1/properties/:id     Update (owner/admin)
DELETE /api/v1/properties/:id     Delete (owner/admin)
```

### Tenants
```
GET    /api/v1/tenants            List my tenants (owner/admin)
GET    /api/v1/tenants/:id        Tenant detail
POST   /api/v1/tenants            Create tenant
PATCH  /api/v1/tenants/:id        Update tenant
PATCH  /api/v1/tenants/:id/kyc/approve
PATCH  /api/v1/tenants/:id/kyc/reject
DELETE /api/v1/tenants/:id        Delete tenant
```

**Health check:** `GET /api/v1/health`

---

## 🛠️ COMMANDS REFERENCE

### Root (Turborepo)
```bash
pnpm dev              # Run both api + web in parallel
pnpm build            # Build all apps
pnpm db:push          # Push Prisma schema to DB
pnpm db:studio        # Open Prisma Studio (DB GUI)
pnpm db:seed          # Seed initial data
pnpm docker:up        # Start MySQL + Redis
pnpm docker:down      # Stop all containers
```

### Backend (apps/api)
```bash
pnpm dev              # Hot-reload dev server
pnpm build            # Compile TypeScript
pnpm start:prod       # Run production build
pnpm prisma studio    # Open DB GUI at localhost:5555
```

### Frontend (apps/web)
```bash
pnpm dev              # Next.js dev (localhost:3000)
pnpm build            # Production build
pnpm start            # Run production build
```

---

## 🚀 DEPLOYMENT

### Backend → DigitalOcean / Railway / Render

**DigitalOcean Droplet (₹1,000/mo):**
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Node 20, pnpm, PM2, Nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx
npm install -g pnpm pm2

# Clone repo
git clone https://github.com/yourusername/pizi-platform.git
cd pizi-platform

# Install + build
pnpm install
cd apps/api
pnpm prisma generate
pnpm build

# Start with PM2
pm2 start dist/main.js --name pizi-api
pm2 startup
pm2 save

# Nginx reverse proxy
# Point api.pizi.in → http://localhost:4000
```

**Railway (Easiest, no SSH):**
1. Sign up at railway.app
2. Connect GitHub repo
3. Add MySQL + Redis services
4. Deploy `apps/api` directory
5. Set env vars in Railway dashboard

### Frontend → Vercel (Free Tier)

```bash
# Install Vercel CLI
npm i -g vercel

cd apps/web
vercel

# Or via GitHub:
# 1. Push to GitHub
# 2. Import on vercel.com
# 3. Set Root Directory: apps/web
# 4. Add NEXT_PUBLIC_API_URL env var
# 5. Deploy
```

---

## ✅ NEXT STEPS (BUILD ORDER)

### Phase 1: Core (Week 1-2)
- [x] Auth (register, login, refresh, JWT)
- [x] Properties CRUD
- [x] Tenants CRUD
- [ ] File uploads (Multer + R2)
- [ ] OTP verification (MSG91)

### Phase 2: Business (Week 3-6)
- [ ] Rent module (bills + payments + Razorpay)
- [ ] Complaints module (with media)
- [ ] Rooms & Beds management
- [ ] Digital Agreements + PDF generation
- [ ] Notifications (email + SMS + push)

### Phase 3: Frontend (Week 7-10)
- [ ] Public pages (home, search, property detail)
- [ ] Owner dashboard (full)
- [ ] Admin dashboard
- [ ] Tenant dashboard
- [ ] Field Executive PWA

### Phase 4: Advanced (Week 11-14)
- [ ] Analytics dashboard (Recharts)
- [ ] SEO optimization (sitemap, metadata)
- [ ] PWA + push notifications
- [ ] Background jobs (BullMQ)
- [ ] Real-time (Socket.io)

### Phase 5: Mobile + Launch (Week 15-16)
- [ ] Capacitor Android APK
- [ ] Play Store submission
- [ ] Production deployment
- [ ] DNS switch from Laravel → Node

---

## 🎯 WHY THIS STACK IS BETTER

| Feature | Laravel (Old) | Node + Next (New) |
|---|---|---|
| **API response** | 300-600ms | **50-150ms** |
| **Concurrent users** | 100-500 | **5,000-10,000** |
| **Real-time** | Hard (Pusher $$) | **Free (Socket.io)** |
| **SEO** | Server render only | **SSR + ISR + Auto-image** |
| **Mobile app** | Capacitor wrap | **70% code reuse with RN** |
| **Type safety** | None | **Full TypeScript** |
| **Background jobs** | Cron only | **BullMQ + Redis** |
| **Caching** | File-based | **Redis (10x faster)** |

---

## 🆘 TROUBLESHOOTING

### Database connection failed
```bash
# Check Docker is running
docker ps

# Restart MySQL
docker-compose restart mysql

# Check logs
docker logs pizi-mysql
```

### Prisma errors
```bash
# Regenerate client
pnpm prisma generate

# Reset database (LOSES DATA)
pnpm prisma db push --force-reset
pnpm prisma db seed
```

### Port already in use
```bash
# Kill process on port 4000 (API)
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000 (Web)
lsof -ti:3000 | xargs kill -9
```

---

## 📞 SUPPORT

Built for: **Atul Sharma** (Help Together Media Pvt Ltd)
Project: pizi.in PG Aggregator
Stack: Node 20 + NestJS 10 + Next.js 14 + Prisma 5 + MySQL 8

**Built on top of existing Laravel pizi.in modules:**
- Tenant + KYC management
- Rent Collection + Razorpay
- Complaints/Maintenance
- Rooms & Beds
- Digital Rent Agreements

---

🚀 **Happy Building!** Live Better. Stay Smarter.
