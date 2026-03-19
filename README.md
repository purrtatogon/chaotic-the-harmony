# Chaotic The Harmony — Full-Stack E-Commerce Platform

_"In active development; expect stuff to break often."_

An admin platform and customer storefront for the fictional ska-punk band _"Chaotic The Harmony"_ (CTH), built with **Java Spring Boot**, **React**, and **PostgreSQL** in a Neo-Brutalist aesthetic. The admin side — **CTH // BACKLINE** — is a Unified Commerce Platform that merges an **Inventory Management System (IMS)** with a custom **Content Management System (CMS)** and the band's e-commerce operations.

**🔐 [Demo CTH // BACKLINE (Admin Platform)](https://chaotic-the-harmony-web.salmonhill-e1429fb9.spaincentral.azurecontainerapps.io/admin/login)**

**🔗 [Demo CTH Storefront (Customer Platform)](https://chaotic-the-harmony-web.salmonhill-e1429fb9.spaincentral.azurecontainerapps.io/)**

---

## 🔑 Demo Credentials

To explore the **CTH // BACKLINE** platform, use the admin credentials below. All accounts share the password: `CTH-backline!123`

| Role | Admin User Full Name | Login Email | Permission Level | Role Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Duke Silver | `d.silver@cth-backline.com` | Full System Access | User management (hiring/firing), API configuration, and database health. Duke is the only one who can see the "destructive" buttons. |
| **MANAGER** | Phoebe Buffay | `p.buffay@cth-backline.com` | Inventory & Store Ops | Updating tour dates, changing merch prices, and managing stock levels. Phoebe ensures the "stage" is set for the fans. |
| **SUPPORT** | Cameron Tucker | `c.tucker@cth-backline.com` | Customer Relations | Managing tickets, processing returns, and updating customer profiles. Cameron handles the "static" when a fan has an issue with an order. |
| **STAFF** | Jason Mendoza | `j.mendoza@cth-backline.com` | Logistics & Shipping | Marking orders as "Shipped," updating warehouse stock counts, and printing manifests. Jason handles the heavy lifting of getting shirts into hands. |
| **AUDITOR** | Kevin Malone | `k.malone@cth-backline.com` | Read-Only Access | Viewing sales reports and order logs. Kevin has "eyes on" everything but "hands off" the data; he can't change a single decimal point. |

**💡 Exploration Tip:** Log in as **Duke Silver (ADMIN)** to view and manage the full roster of users in the **Admin Dashboard > Users Tab**.


To explore the **Chaotic The Harmony** storefront, use the customer credentials below. All accounts share the password: `demoCTHcustomer!123`

| Persona | Name | Login Email | Data Profile |
| :--- | :--- | :--- | :--- |
| **The Mega-Fan** | Troy Barnes | `t.barnes@greendale.edu` | 15+ Orders, Full Wishlist |
| **The Prodigy** | Dewey Wilkerson | `d.wilkerson@luckyaid.com` | 0 Orders, Large Wishlist |
| **The VIP** | Barbara Howard | `b.howard@abbott.edu` | Mixed History, Vault Data |

**💡 Exploration Tip:** Log in as **Troy Barnes (The Mega-Fan)** to see the Backstage Pass (Profile) at full capacity, featuring extensive order history, pagination, and a curated wishlist.


The five core admins and three customer personas are hardcoded as immutable demo keys in `SeederService.java`. This ensures a stable, consistent dataset across every database reset.

---

## Project Background

This project began as a static Bootstrap website for a bootcamp assignment and has been re-architected many times before reaching this fully containerized, dynamic full-stack application. The goal was to prioritize Data Integrity, Scalability, and Developer Experience (DX) over simple functionality — or as I like to put it, "Build it like it's real." That meant rejecting "Lorem Ipsum" placeholders and treating _"Chaotic The Harmony"_ as a real client requiring cohesive branding, realistic data, and production-ready patterns.

### 🎸 The "CTH" Brand Concept

The name _"Chaotic The Harmony"_ is a nod to the real-world band _"Maximum The Hormone."_ The fictional band's surreal "ska-punk" persona draws inspiration from _The Aquabats!_, _Awkwafina_, _Destroy Boys_, _Käärijä_, _Baby Lasagna_, _Creepy Nuts_, and the musical comedy of _Bo Burnham_, _Brian David Gilbert_, _Tom Cardy_, and _Farideh_.

### 📊 Data Realism & Seeding

I manually architected the product catalog rather than using random generators, to ensure the database schema faced real-world challenges.

- **World Building & Research, by a Human:** I authored the band's entire discography, merch lines, and catalog structure. I explored dozens of musicians' websites, merch stores, and music gear retailers, and revisited e-commerce sites I've used as a customer to identify features worth implementing. If a product has a funny name or an album concept sounds weird, it's because that all came out of my brain.
- **Generative AI strictly as a "Consultant":** I used Gemini only to identify gaps in the product lineup — checking things like 'Enough items for X collection?' or 'Enough color variants for Y item?'
- **Catalog seed vs. live data:** Product rows in `data/products.csv` (and related CSVs) load into PostgreSQL when a row is missing; ongoing edits from the admin UI are stored in the database, not written back to CSV. Marketing and page blocks are seeded from `cms_*.csv` files and are still being fleshed out.

### 🎨 Design & Accessibility

**Aesthetic:** [Neo-Brutalism](https://aesthetics.fandom.com/wiki/Neubrutalism) using [Accessible Color Palettes](https://shop.stephaniewalter.design/b/six-yellow-purple-accessible-color-palettes) by [Stephanie Walter](https://stephaniewalter.design/) — "Soda Pop, pink strawberry edition" (admin) and "Stephanie's Yellow with a vibrant purple twist" (storefront). Dual-color palettes via `ThemeContext` and CSS Modules ensure sufficient contrast ratios, aiming for WCAG AAA.
- **Original Artwork:** I intend to personally create and upload unique assets — including the band's wordmark, album covers, and apparel designs — using **Affinity 3.0**.
- **Licensing Standards:** Fonts (e.g., _Daydream_) are used under valid desktop licenses, and stock media is sourced from royalty-free vendors (Pexels) or professional mockup providers (Creatsy).

---

## Architecture & Tech Stack

Monorepo (`/backend` + `/frontend`), Docker-first, deployed to **Microsoft Azure** (App Service + ACR + managed PostgreSQL) with **GitHub Actions** CI/CD. A scheduled "Nuclear Reset" wipes and re-seeds the demo database every 8 hours to prevent data drift.

| Layer | Stack |
| :--- | :--- |
| **Backend** | Java 21, Spring Boot 3.4.2, Spring Security (JWT + RBAC), JPA/Hibernate, PostgreSQL |
| **Frontend** | React 19, Vite 7, React Router, Context API + custom hooks, CSS Modules, Nginx (production) |

---

## Features & Roadmap

No design prototypes were made upfront — UI and UX decisions are being made as I build.

### Storefront (Customer)
| Status | Feature |
| :---: | :--- |
| ✅ | Dynamic catalog with collections, search, filtering, and sorting |
| ✅ | Product detail pages with image galleries, variant/size selection, breadcrumbs, and quick-add-to-cart |
| ✅ | API-driven page copy via CMS site content blocks |
| ✅ | Cart management with simulated checkout flow |
| ✅ | Customer login, sign-up, profile with order history ("Backstage Pass"), and wishlist |
| 🚧 | Refining layout and visuals for remaining pages |

### Admin Dashboard (IMS & CMS)
| Status | Feature |
| :---: | :--- |
| ✅ | Unified interface for inventory/stock and site content (news, bios, page blocks) |
| ✅ | Per-field inline editing of product content (Name, Description, Materials + Specs, Shipping info) with Markdown toolbar and live GFM preview |
| ✅ | Dedicated media editing with image reordering and alt text editing (URLs from seeded catalog/CDN links; no server-side upload pipeline) |
| ✅ | Role-based security with granular permissions per role |
| ✅ | Inline stock quantity editing with audit trail |

### Up Next
| Status | Area |
| :---: | :--- |
| 🚧 | **Assets** — Integrating iteratively; placeholder SVGs with descriptive alt-text are used where final media is pending |
| 🚧 | **Accessibility** — Keyboard navigation, focus management, and screen reader coverage under active development |
| ⏳ | **Testing** — No custom tests yet. Planning JUnit 5 for the backend Service Layer and Vitest + jest-axe for frontend components as I learn |
| ⏳ | **Notifications** — Might integrate with SendGrid for order confirmations |

---

## 🏃‍♂️ Getting Started

### Option A: Docker (recommended)

Requires only **Docker Desktop**.

```bash
cp .env.example .env          # then edit with your DB credentials
docker-compose up --build -d
```

| Service | URL |
| :--- | :--- |
| Storefront | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

The `docker` profile uses `create-drop`, so every restart is a clean database seeded with the full CTH catalog and demo users. Product imagery is referenced by URLs in seed data (and any edits you persist in Postgres); the backend does not host an image-upload API.

### Option B: Manual (for development)

Requires **Java 21**, **Node.js 20+**, and **PostgreSQL 16+**.

**1. Database** — Create a local Postgres database matching `backend/src/main/resources/application-local.properties` (default: `cthdb` on `localhost:5432`).

**2. Backend**

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

The `local` profile activates `demo`, which seeds the database with the full catalog and demo users. Uses `ddl-auto=update`, so data persists across restarts.

**3. Frontend**

```bash
cd frontend
npm install
npm run dev
```

`frontend/.env.development` already points `VITE_API_URL` at `http://localhost:8080/api/v1`.

| Service | URL |
| :--- | :--- |
| Storefront (Vite) | http://localhost:5173 |
| Backend API | http://localhost:8080 |

---

> **Built with the mindset that even the 'boring' parts of an app — like inventory and data seeding — deserve a cohesive identity.**
>
> *Thanks for reading — and for humoring a beginner's attempt to hold together production-grade Spring Boot, Neo-Brutalist sharp edges, and a fictional band's entire discography into one cohesive backline. ◕⩊◕*

---
