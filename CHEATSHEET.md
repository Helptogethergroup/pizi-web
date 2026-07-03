# 🎯 PIZI — Quick Start Cheatsheet

## ⚡ Daily Commands

```bash
# Start everything (Docker + API + Web)
docker-compose up -d
cd apps/api && pnpm dev    # Terminal 1
cd apps/web && pnpm dev    # Terminal 2

# Stop everything
docker-compose down
```

## 🗄️ Database Commands

```bash
cd apps/api

# After schema changes
pnpm prisma generate       # Regenerate client
pnpm prisma db push        # Push schema to DB (dev)
pnpm prisma db pull        # Pull schema from existing DB
pnpm prisma studio         # Open GUI (localhost:5555)
pnpm prisma db seed        # Run seed script
```

## 🔍 Useful URLs

| URL | Purpose |
|---|---|
| http://localhost:3000 | Frontend (Pizi.in) |
| http://localhost:3000/login | Login page |
| http://localhost:3000/owner | Owner dashboard |
| http://localhost:3000/admin | Admin dashboard |
| http://localhost:4000 | Backend API base |
| http://localhost:4000/api/v1/health | Health check |
| http://localhost:4000/docs | Swagger API docs |
| http://localhost:5555 | Prisma Studio |
| http://localhost:8025 | Mailhog (catch emails) |

## 🔐 Default Logins

```
Admin:  admin@pizi.in / admin123
Owner:  owner@pizi.in / owner123
```

## 📦 Adding New NPM Packages

```bash
# Backend
cd apps/api
pnpm add package-name

# Frontend
cd apps/web
pnpm add package-name
```

## 🐛 Common Issues

### "Cannot find module @prisma/client"
```bash
cd apps/api && pnpm prisma generate
```

### Port 3000 already in use
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Docker container won't start
```bash
docker-compose down -v   # Remove volumes
docker-compose up -d
```

### Frontend CORS error
Check `apps/api/.env`:
```
CORS_ORIGINS=http://localhost:3000
```

## 🚀 Quick Deploy

### Frontend → Vercel (Free)
```bash
cd apps/web
npx vercel
```

### Backend → DigitalOcean
```bash
# On VPS:
bash scripts/deploy.sh
```

## 💡 Pro Tips

1. **Hot reload:** Both apps have hot reload — save file, see changes
2. **Swagger:** Test APIs at localhost:4000/docs (no Postman needed)
3. **Prisma Studio:** Better than phpMyAdmin for browsing data
4. **Mailhog:** All emails caught at localhost:8025 (no real emails sent)
5. **React Query DevTools:** Bottom-right of browser in dev mode

---

🎯 **Bookmark this page** — you'll use these daily.
