# Pizi Frontend (Next.js)

Next.js frontend for **pizi.in** — connects to Laravel REST API at `https://pizi.in/api`.

## 🚀 INSTALLATION

### 1. Extract zip + copy files

Replace contents of `C:\projects\pizi-platform\apps\web\` with files from this zip.

Or simpler: delete old `web/` and extract this zip in its place.

### 2. Install dependencies

```bash
cd C:\projects\pizi-platform\apps\web
pnpm install
```

### 3. Start dev server

```bash
pnpm dev
```

Open: http://localhost:3000

## 📋 PAGES

| Route | Description |
|---|---|
| `/` | Home with featured PGs |
| `/search` | Search with filters |
| `/property/[slug]` | Property detail |
| `/city/[slug]` | City listings |
| `/blog` | Blog list |
| `/blog/[slug]` | Blog detail |
| `/login` | Login |
| `/register` | Register |

## 🔌 API

All requests go to `https://pizi.in/api/*` (set in `.env.local`).

Auth token saved in `localStorage` as `pizi_token`.

## 🎨 BRAND

- **Colors:** Navy `#0F2540`, Coral `#FF5C39`, Cream `#FAF7F2`
- **Fonts:** Fraunces (display), Plus Jakarta Sans (body)

## 🚀 DEPLOY

```bash
# Vercel
npx vercel

# Or build for static export
pnpm build
```
