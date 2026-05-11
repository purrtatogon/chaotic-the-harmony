# Chaotic The Harmony — Full-Stack E-Commerce Platform

*"In active development; expect stuff to break often."*

An admin platform and customer storefront for the fictional ska-punk band *"Chaotic The Harmony"* (CTH), built with **Java Spring Boot**, **React**, and **PostgreSQL** in a Neo-Brutalist aesthetic. The admin side — **CTH // BACKLINE** — is a Unified Commerce Platform that merges an **Inventory Management System (IMS)** with a custom **Content Management System (CMS)** and the band's e-commerce operations.

- **🔐 Admin:** `<my-frontend-railway-url>/admin/login`
- **🔗 Storefront:** `<my-frontend-railway-url>`  
*(Will replace with real links in this README once Railway domains are issued.)*

> **Deployment:** Hosted on **Railway** (PostgreSQL + backend + frontend). Set `**SPRING_PROFILES_ACTIVE=demo*`* on the backend. That loads `application-demo.properties`: `**create-drop**` schema, **seed on startup**, **JWT/CORS** from env vars, datasource from `**DATABASE_URL`** (use a `**jdbc:postgresql://...**` URL), `**PGUSER**`, and `**PGPASSWORD**`. Build the frontend with a production `**VITE_API_URL**` pointing at your public API.
>
> **Demo refresh:** With the `**demo`** profile active, the API **re-seeds** on a schedule at **00:00, 08:00, and 16:00 UTC** (storefront banner). Restart/redeploy still triggers startup seeding. `**DEMO_SCHEDULED_RESET_ENABLED`** defaults to **on** for `demo` only; set `**false`** in Railway (or `.env` for Compose) to pause cron resets.

---

## 🔑 Demo Credentials

To explore the **CTH // BACKLINE** platform, use the admin credentials below. All accounts share the password: `CTH-backline!123`


| Role        | Admin User Full Name | Login Email                  | Permission Level      | Role Responsibilities                                                                                                                               |
| ----------- | -------------------- | ---------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ADMIN**   | Duke Silver          | `d.silver@cth-backline.com`  | Full System Access    | User management (hiring/firing), API configuration, and database health. Duke is the only one who can see the "destructive" buttons.                |
| **MANAGER** | Phoebe Buffay        | `p.buffay@cth-backline.com`  | Inventory & Store Ops | Updating tour dates, changing merch prices, and managing stock levels. Phoebe ensures the "stage" is set for the fans.                              |
| **SUPPORT** | Cameron Tucker       | `c.tucker@cth-backline.com`  | Customer Relations    | Managing tickets, processing returns, and updating customer profiles. Cameron handles the "static" when a fan has an issue with an order.           |
| **STAFF**   | Jason Mendoza        | `j.mendoza@cth-backline.com` | Logistics & Shipping  | Marking orders as "Shipped," updating warehouse stock counts, and printing manifests. Jason handles the heavy lifting of getting shirts into hands. |
| **AUDITOR** | Kevin Malone         | `k.malone@cth-backline.com`  | Read-Only Access      | Viewing sales reports and order logs. Kevin has "eyes on" everything but "hands off" the data; he can't change a single decimal point.              |


**💡 Exploration Tip:** Log in as **Duke Silver (ADMIN)** to view and manage the full roster of users in the **Admin Dashboard > Users Tab**.

To explore the **Chaotic The Harmony** storefront, use the customer credentials below. All accounts share the password: `demoCTHcustomer!123`


| Persona          | Name            | Login Email                | Data Profile              |
| ---------------- | --------------- | -------------------------- | ------------------------- |
| **The Mega-Fan** | Troy Barnes     | `t.barnes@greendale.edu`   | 15+ Orders, Full Wishlist |
| **The Prodigy**  | Dewey Wilkerson | `d.wilkerson@luckyaid.com` | 0 Orders, Large Wishlist  |
| **The VIP**      | Barbara Howard  | `b.howard@abbott.edu`      | Mixed History, Vault Data |


**💡 Exploration Tip:** Log in as **Troy Barnes (The Mega-Fan)** to see the Backstage Pass (Profile) at full capacity, featuring extensive order history, pagination, and a curated wishlist.

The five core admins and three customer personas are hardcoded as immutable demo keys in `SeederService.java`. This ensures a stable, consistent dataset across every database reset.

---

## Project Background

This project began as a static Bootstrap website for a bootcamp assignment and has been re-architected many times before reaching this fully containerized, dynamic full-stack application. The goal was to prioritize Data Integrity, Scalability, and Developer Experience (DX) over simple functionality — or as I like to put it, "Build it like it's real." That meant rejecting "Lorem Ipsum" placeholders and treating *"Chaotic The Harmony"* as a real client requiring cohesive branding, realistic data, and production-ready patterns.

### 🎸 The "CTH" Brand Concept

The name *"Chaotic The Harmony"* is a nod to the real-world band *"Maximum The Hormone."* The fictional band's surreal "ska-punk" persona draws inspiration from *The Aquabats!*, *Awkwafina*, *Destroy Boys*, *Käärijä*, *Baby Lasagna*, *Creepy Nuts*, and the musical comedy of *Bo Burnham*, *Brian David Gilbert*, *Tom Cardy*, and *Farideh*.

### 📊 Data Realism & Seeding

I manually architected the product catalog rather than using random generators, to ensure the database schema faced real-world challenges.

- **World Building & Research, by a Human:** I authored the band's entire discography, merch lines, and catalog structure. I explored dozens of musicians' websites, merch stores, and music gear retailers, and revisited e-commerce sites I've used as a customer to identify features worth implementing. If a product has a funny name or an album concept sounds weird, it's because that all came out of my brain.
- **Generative AI strictly as a "Consultant":** I used Gemini only to identify gaps in the product lineup — checking things like 'Enough items for X collection?' or 'Enough color variants for Y item?'
- **Catalog seed vs. live data:** Product rows in `data/products.csv` (and related CSVs) load into PostgreSQL when a row is missing; ongoing edits from the admin UI are stored in the database, not written back to CSV. Marketing and page blocks are seeded from `cms_*.csv` files and are still being fleshed out.

### 🎨 Design & Accessibility

**Aesthetic:** [Neo-Brutalism](https://aesthetics.fandom.com/wiki/Neubrutalism) using [Accessible Color Palettes](https://shop.stephaniewalter.design/b/six-yellow-purple-accessible-color-palettes) by [Stephanie Walter](https://stephaniewalter.design/) — "Soda Pop, pink strawberry edition" (admin) and "Stephanie's Yellow with a vibrant purple twist" (storefront). Dual-color palettes via `ThemeContext` and CSS Modules ensure sufficient contrast ratios, aiming for WCAG AAA.

- **Original Artwork:** I intend to personally create and upload unique assets — including the band's wordmark, album covers, and apparel designs — using **Affinity 3.0**.
- **Licensing Standards:** Fonts (e.g., *Daydream*) are used under valid desktop licenses, and stock media is sourced from royalty-free vendors (Pexels) or professional mockup providers (Creatsy).

---

## Architecture & Tech Stack

Monorepo (`/backend` + `/frontend`), Docker-first, deployed to **Railway** (managed PostgreSQL + two container services). **Local Compose** sets `**SPRING_PROFILES_ACTIVE=demo,docker`**: `**demo**` enables seeding and the demo scheduler; `**docker**` overrides last so the API uses `**ddl-auto=update**` (data survives container restarts while the `postgres_data` volume remains) and `**SPRING_DATASOURCE_***` aimed at the `db` service. **Railway** runs `**demo`** only, with `**create-drop**` and hosted Postgres env vars.


| Layer        | Stack                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------- |
| **Backend**  | Java 21, Spring Boot 3.4.2, Spring Security (JWT + RBAC), JPA/Hibernate, PostgreSQL         |
| **Frontend** | React 19, Vite 7, React Router, Context API + custom hooks, CSS Modules, Nginx (production) |


---

## Features & Roadmap

No design prototypes were made upfront — UI and UX decisions are being made as I build.

### Storefront (Customer)


| Status | Feature                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------- |
| ✅      | Dynamic catalog with collections, search, filtering, and sorting                                      |
| ✅      | Product detail pages with image galleries, variant/size selection, breadcrumbs, and quick-add-to-cart |
| ✅      | API-driven page copy via CMS site content blocks                                                      |
| ✅      | Cart management with simulated checkout flow                                                          |
| ✅      | Customer login, sign-up, profile with order history ("Backstage Pass"), and wishlist                  |
| 🚧     | Refining layout and visuals for remaining pages                                                       |


### Admin Dashboard (IMS & CMS)


| Status | Feature                                                                                                                                      |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅      | Unified interface for inventory/stock and site content (news, bios, page blocks)                                                             |
| ✅      | Per-field inline editing of product content (Name, Description, Materials + Specs, Shipping info) with Markdown toolbar and live GFM preview |
| ✅      | Dedicated media editing with image reordering and alt text editing (URLs from seeded catalog/CDN links; no server-side upload pipeline)      |
| ✅      | Role-based security with granular permissions per role                                                                                       |
| ✅      | Inline stock quantity editing with audit trail                                                                                               |


### Up Next


| Status | Area                                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 🚧     | **Assets** — Integrating iteratively; placeholder SVGs with descriptive alt-text are used where final media is pending                     |
| 🚧     | **Accessibility** — Keyboard navigation, focus management, and screen reader coverage under active development                             |
| ⏳      | **Testing** — No custom tests yet. Planning JUnit 5 for the backend Service Layer and Vitest + jest-axe for frontend components as I learn |
| ⏳      | **Notifications** — Might integrate with SendGrid for order confirmations                                                                  |


---

## 🏃‍♂️ Getting Started

### Option A: Docker (recommended)

Requires only **Docker Desktop**.

```bash
cp .env.example .env   # set JWT_SECRET_KEY (required). POSTGRES_* + optional DEMO_SCHEDULED_RESET_ENABLED are documented in the example file.
docker-compose up --build -d
```


| Service     | URL                                            |
| ----------- | ---------------------------------------------- |
| Storefront  | [http://localhost:5173](http://localhost:5173) |
| Backend API | [http://localhost:8080](http://localhost:8080) |
| PostgreSQL  | localhost:5432                                 |


Compose activates `**demo,docker**`: the stack still **seeds on startup** (and can **cron-reseed** if you set `**DEMO_SCHEDULED_RESET_ENABLED=true`** in `.env`), but `**ddl-auto=update**` means Postgres data is **not** wiped on every backend restart unless you remove the volume or change config. Product imagery is referenced by URLs in seed data; the backend does not host an image-upload API.

### Option B: Manual (for development)

Requires **Java 21**, **Node.js 20+**, and **PostgreSQL 16+**.

**1. Database** — Create a local Postgres database (e.g. `cthdb` on `localhost:5432`) matching the JDBC URL you set in `application-local.properties`.

**2. Backend** — From repo root, copy the example (the real file is gitignored), edit secrets, then run with **`demo` first and `local` last** so `SeederService` loads and `application-local.properties` overrides `create-drop`:

```bash
cp backend/src/main/resources/application-local.properties.example backend/src/main/resources/application-local.properties
cd backend
# Edit src/main/resources/application-local.properties (Postgres password, JWT secret)
./mvnw spring-boot:run -Dspring-boot.run.profiles=demo,local
```

`demo` enables seeding (and scheduled UTC reseeds unless you set `demo.scheduled-reset.enabled=false` in that file). `local` wins on overlapping keys, so **`ddl-auto=update`** and your localhost JDBC URL apply.

**3. Frontend**

```bash
cd frontend
npm install
npm run dev
```

`frontend/.env.development` already points `VITE_API_URL` at `http://localhost:8080/api/v1`.


| Service           | URL                                            |
| ----------------- | ---------------------------------------------- |
| Storefront (Vite) | [http://localhost:5173](http://localhost:5173) |
| Backend API       | [http://localhost:8080](http://localhost:8080) |


---

> **Thanks for checking out this mashup of full-stack development, a fictional band’s discography and merch, demo users, and Neo-Brutalist edges!**
>
> ◕⩊◕
>
> *— s0raia*

---
