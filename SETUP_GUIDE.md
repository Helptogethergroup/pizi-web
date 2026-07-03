# 🚀 PIZI Node.js Setup — Step by Step (Hinglish)

Bhai yeh complete starter project hai. Setup karne ke liye **yeh steps follow kar**.

---

## ⚙️ PEHLE INSTALL KARO (ONE-TIME)

### 1. Node.js 20 Install Karo
**Windows:** https://nodejs.org → Download LTS (Recommended)
Install karke check kar:
```bash
node -v   # Output: v20.x.x
npm -v    # Output: 10.x.x
```

### 2. pnpm Install Karo (Faster than npm)
```bash
npm install -g pnpm
pnpm -v   # Should show 8.x.x
```

### 3. Docker Desktop Install Karo
**Windows:** https://www.docker.com/products/docker-desktop
Install karke run karo. **Whale icon** taskbar me dikhna chahiye.

### 4. VS Code Install Karo (already hai probably)
**Extensions install karo:**
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- ES7 React snippets

### 5. Git Install Karo
**Windows:** https://git-scm.com/download/win

---

## 📦 PROJECT SETUP (STEP-BY-STEP)

### Step 1: Project Extract Karo
```
1. pizi-platform.zip download karo
2. C:\projects\ folder me extract karo
3. Result: C:\projects\pizi-platform\
```

### Step 2: VS Code me Open Karo
```bash
# Open terminal in VS Code (Ctrl + `)
cd C:\projects\pizi-platform
code .
```

### Step 3: Dependencies Install Karo
```bash
# Root me jaake
pnpm install

# Yeh 2-3 minute lagega (1st time)
# Sab packages download honge dono apps me
```

### Step 4: Docker Services Start Karo
```bash
# MySQL + Redis + Mailhog start
docker-compose up -d

# Verify:
docker ps

# 3 containers dikhne chahiye:
# - pizi-mysql (port 3306)
# - pizi-redis (port 6379)
# - pizi-mailhog (port 8025)
```

### Step 5: Backend Setup
```bash
cd apps\api

# Env file copy
copy .env.example .env

# Prisma client generate
pnpm prisma generate

# Database tables create
pnpm prisma db push

# Seed default users
pnpm prisma db seed
```

**Expected output:**
```
🌱 Seeding database...
✓ Seed complete!
Admin login: admin@pizi.in / admin123
Owner login: owner@pizi.in / owner123
```

### Step 6: Backend Start Karo
```bash
# Still in apps/api folder
pnpm dev

# Output:
# 🚀 PIZI API running on http://localhost:4000
# 📚 Swagger docs at http://localhost:4000/docs
```

**Browser kholo:** http://localhost:4000/api/v1/health
**Expected JSON:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected"
  }
}
```

✅ **Backend working!**

### Step 7: Frontend Setup (NEW TERMINAL)
```bash
# NEW VS Code terminal open kar (Ctrl + Shift + `)
cd apps\web

# Env file copy
copy .env.example .env

# Frontend start
pnpm dev

# Output:
# ▲ Next.js 14.2.x
# - Local: http://localhost:3000
```

**Browser kholo:** http://localhost:3000
**Pizi homepage dikhega** with hero section.

### Step 8: Login Test
1. http://localhost:3000/login pe jao
2. Email: `owner@pizi.in`
3. Password: `owner123`
4. **Sign In** click
5. ✅ Owner Dashboard pe redirect

---

## 🗄️ HOSTINGER SE DATA IMPORT KARO

### Option A: Export from Hostinger → Import Local

#### 1. Hostinger phpMyAdmin se Export
```
1. Hostinger panel login
2. Databases → u112235086_findpizi
3. phpMyAdmin open
4. Top menu → Export
5. Method: Quick
6. Format: SQL
7. Go button click
8. .sql file download hogi
```

#### 2. Import to Local MySQL
```bash
# .sql file ko C:\projects\pizi-platform\ me rakho

# Run:
docker exec -i pizi-mysql mysql -uroot -ppizi_root_2026 pizi_db < u112235086_findpizi.sql

# Verify:
docker exec -it pizi-mysql mysql -uroot -ppizi_root_2026 -e "USE pizi_db; SHOW TABLES;"

# 30+ tables dikhne chahiye
```

#### 3. Prisma Sync
```bash
cd apps\api

# Existing data se schema generate
pnpm prisma db pull

# Confirm overwrite when asked
# yes/y

# Generate client
pnpm prisma generate
```

### Option B: Direct Hostinger Connection (Advanced)

⚠️ Hostinger shared hosting usually **doesn't allow** remote MySQL.
Use **Option A** for safety.

If you have VPS:
```env
# apps/api/.env
DATABASE_URL="mysql://USER:PASS@HOST:3306/DBNAME"
```

---

## 🎨 PRISMA STUDIO (Database GUI)

Database visually dekhne ke liye:
```bash
cd apps\api
pnpm prisma studio

# Browser open hoga: http://localhost:5555
# Sab tables, data, edit kar sakte ho
```

---

## 📁 PROJECT STRUCTURE SAMJHO

```
pizi-platform/
├── apps/
│   ├── api/                    👈 BACKEND (Node.js + NestJS)
│   │   ├── prisma/
│   │   │   ├── schema.prisma  👈 Sab tables ki definition
│   │   │   └── seed.ts        👈 Default data
│   │   └── src/
│   │       ├── main.ts        👈 Entry point
│   │       ├── app.module.ts  👈 All modules wired
│   │       ├── common/        👈 Shared (guards, decorators)
│   │       └── modules/
│   │           ├── auth/      👈 Login/Register/JWT
│   │           ├── properties/👈 Properties CRUD
│   │           ├── tenants/   👈 Tenants + KYC
│   │           ├── rent/      👈 Rent bills + payments
│   │           ├── complaints/👈 Complaints
│   │           ├── rooms/     👈 Rooms + Beds
│   │           ├── agreements/👈 Digital agreements
│   │           └── ...
│   └── web/                    👈 FRONTEND (Next.js)
│       ├── src/
│       │   ├── app/           👈 Pages (App Router)
│       │   │   ├── page.tsx   👈 Home page
│       │   │   ├── login/     👈 Login page
│       │   │   ├── owner/     👈 Owner dashboard
│       │   │   └── admin/     👈 Admin dashboard
│       │   ├── components/    👈 Reusable UI
│       │   └── lib/
│       │       ├── api.ts     👈 Axios HTTP client
│       │       └── auth-store.ts 👈 Auth state
│       └── public/            👈 Static files (images)
├── docker-compose.yml         👈 MySQL + Redis containers
├── package.json
└── README.md
```

---

## 🔧 COMMON ISSUES & FIXES

### Issue 1: Docker not running
**Symptom:** `docker-compose up` fails
**Fix:** Docker Desktop start kar (Windows taskbar → Whale icon)

### Issue 2: Port 3306 already in use
**Symptom:** MySQL container fails
**Fix:** Local MySQL (XAMPP) stop kar pehle
```bash
# XAMPP control panel → MySQL → Stop
# Then:
docker-compose down
docker-compose up -d
```

### Issue 3: Prisma db push fails
**Fix:**
```bash
# Reset Prisma
pnpm prisma generate
pnpm prisma db push --force-reset
pnpm prisma db seed
```

### Issue 4: pnpm install fails
**Fix:**
```bash
# Clear cache
pnpm store prune
rm -rf node_modules
pnpm install
```

### Issue 5: localhost:3000 doesn't load
**Fix:**
- Port already busy?
- `pnpm dev` me errors?
- Check terminal output for errors

### Issue 6: API calls fail (CORS)
**Fix:**
Check `apps/api/.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## 🚀 DEPLOYMENT GUIDE

### Production Deployment Strategy

**Step 1: Get VPS**
- Hostinger VPS KVM 2: ₹600/mo
- OR DigitalOcean Droplet: $12/mo (~₹1000)

**Step 2: GitHub Push**
```bash
git init
git add .
git commit -m "Initial Pizi platform"
git remote add origin https://github.com/USERNAME/pizi-platform.git
git push -u origin main
```

**Step 3: Backend on VPS**
```bash
# SSH into VPS
ssh root@your-vps-ip

# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx mysql-server redis-server

# Install pnpm + PM2
npm install -g pnpm pm2

# Clone repo
git clone https://github.com/USERNAME/pizi-platform.git
cd pizi-platform/apps/api
pnpm install
pnpm prisma generate
pnpm build

# Start with PM2
pm2 start dist/main.js --name pizi-api
pm2 save
pm2 startup
```

**Step 4: Nginx Reverse Proxy**
```bash
nano /etc/nginx/sites-available/api.pizi.in

# Add:
server {
    listen 80;
    server_name api.pizi.in;
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/api.pizi.in /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# SSL with Certbot
apt install certbot python3-certbot-nginx
certbot --nginx -d api.pizi.in
```

**Step 5: Frontend on Vercel (Free)**
```bash
# Install Vercel CLI
npm i -g vercel

cd apps/web
vercel

# Follow prompts
# Set env: NEXT_PUBLIC_API_URL=https://api.pizi.in
```

**Step 6: DNS Setup (Cloudflare)**
```
api.pizi.in → VPS IP (A record)
pizi.in → Vercel (CNAME to cname.vercel-dns.com)
www.pizi.in → Vercel (CNAME)
```

---

## 📚 LEARNING RESOURCES

**NestJS (Backend):**
- https://docs.nestjs.com (official docs)
- YouTube: "NestJS Crash Course" (3-4 hr)

**Next.js 14 (Frontend):**
- https://nextjs.org/learn (official tutorial)
- YouTube: "Next.js 14 Full Course" (5 hr)

**Prisma (ORM):**
- https://www.prisma.io/docs (excellent docs)

**TypeScript:**
- https://www.typescriptlang.org/docs/handbook

---

## 💡 PRO TIPS

1. **Always run `pnpm prisma generate`** after schema changes
2. **Use Prisma Studio** to inspect data (better than phpMyAdmin)
3. **VS Code split terminal** — backend + frontend simultaneously
4. **Swagger docs** at localhost:4000/docs — test APIs directly
5. **React Query DevTools** — debug API calls in browser
6. **Git commit often** — easy rollback

---

## 🎯 NEXT STEPS

Setup done? Ab build kar:

**Week 1-2:** Auth + File Uploads
**Week 3-4:** Rent module complete (Razorpay integration)
**Week 5-6:** Complaints + Rooms modules
**Week 7-8:** Frontend dashboards
**Week 9-10:** Public pages + SEO
**Week 11-12:** Testing + Deployment
**Week 13:** GO LIVE 🚀

---

## 🆘 STUCK?

1. **Check terminal logs** carefully
2. **Search error on Google** (Stack Overflow)
3. **Check Swagger docs:** http://localhost:4000/docs
4. **Open Prisma Studio:** see actual data
5. **Restart Docker:** `docker-compose restart`

---

**Bhai sab setup ho gaya?** Test login try kar:
```
http://localhost:3000/login
Email: owner@pizi.in
Password: owner123
```

✅ Owner dashboard khulna chahiye!

🚀 **Live Better. Stay Smarter. Build Better.**
