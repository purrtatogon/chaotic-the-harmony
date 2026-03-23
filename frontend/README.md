# 🛍️ CTH Admin Dashboard & Storefront — React Client

This directory contains the **React/Vite** application that serves as the "Face" of the Unified Commerce Platform. It features a **Dual-Theme System** (Admin Dashboard vs. Customer Storefront), a **Neo-Brutalist** design aesthetic, and a clear split between **shared**, **customer**, and **admin** UI.

## 🛠 Tech Stack & Architecture

- **Core:** React 18 + Vite
- **Routing:** React Router v6 (protected admin routes)
- **HTTP Client:** Axios (`src/api/axios.js`, JWT interceptors)
- **Site content:** `src/api/siteContent.js` → `GET /site-content` (full URL from `VITE_API_URL`), consumed via `useSiteContent` and `SiteContentContext`
- **Content rendering:** `react-markdown` (safe rich text for product descriptions and CMS fields)
- **Styling:** CSS Modules + theme CSS under `src/styles/themes/` + `ThemeContext` for palette switching
- **State:** `ThemeContext`, `AuthContext`, `CartContext`, `SiteContentContext`
- **Accessibility:** `RouteAnnouncer` for route change announcements; honor reduced motion where implemented
- **Visuals:** **Demo Banner** with UTC-based countdown for demo resets (`DemoBanner.module.css`)

## 📂 Project Structure

```text
frontend/
├── src/
│   ├── api/              # Axios modules (auth, products, siteContent, …)
│   ├── assets/           # Fonts (e.g. Daydream), images
│   ├── components/
│   │   ├── Global/       # Shared UI: Button, Form, Table, DemoBanner, RouteAnnouncer, …
│   │   ├── Customer/     # Storefront-only sections (Hero, MegaNav, Store widgets, …)
│   │   └── Admin/        # Dashboard-only (Sidebar, PageHeader, ProductImageGallery, …)
│   ├── contexts/         # ThemeContext, AuthContext, CartContext, SiteContentContext
│   ├── hooks/            # useSiteContent, useMediaQuery, useApi, …
│   ├── layouts/          # CustomerLayout, DashboardLayout wrappers
│   ├── pages/
│   │   ├── Admin/        # IMS views (orders, products, users, warehouses, …)
│   │   └── Customer/     # Storefront (Home, Store, About, FAQ, login, sign-up, …)
│   ├── styles/themes/    # customer.module.css, admin.module.css, admin.css, …
│   ├── types/            # TypeScript types (e.g. siteContent.ts)
│   ├── utils/            # Formatters, theme helpers, parsers
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── Dockerfile            # Multi-stage: Node build → Nginx
├── nginx.conf            # SPA fallback for production
└── .env.development      # Local Vite env (VITE_API_URL) — do not commit secrets
```

## ⚙️ Local Development

**1. Prerequisites**

- **Node.js:** v20+ (LTS)
- **Backend:** Spring Boot API on `http://localhost:8080` (or your chosen host)

**2. Environment**

Create `frontend/.env.development` (or copy from a team-provided example) with:

```bash
VITE_API_URL=http://localhost:8080/api/v1
```

Vite embeds this at build/dev time; the client calls paths such as `/site-content` relative to that base.

**3. Run**

```bash
npm install
npm run dev
```

Open **http://localhost:5173** (Vite default).

---

## 🐳 Production & Docker

In production (Azure), the app is containerized and served via Nginx.

- **Build-time API URL:** The Docker image build should receive `VITE_API_URL` as a build argument (see root `docker-compose.yml` for local Compose).
- **Image versioning:** Managed via ACR (e.g. `frontend:v3`).
- **Internal port:** `80` (Nginx).
- **Exposed host port:** `3000` when using the repo’s Docker Compose, or `80`/`443` on Azure.

<p align="center">◕⩊◕<br>
<em>Thanks for checking out the Frontend!</em>
</p>
