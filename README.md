# Chaotic The Harmony — Full-Stack E-Commerce Platform

A production-grade **Unified Commerce Platform (UCP)** for the fictional ska-punk band _"Chaotic The Harmony"_ (CTH). This solution merges a complex **Inventory Management System (IMS)** with a custom **Content Management System (CMS)**, built with **React**, **Java Spring Boot**, and **PostgreSQL**.

**🔗 [Live Demo Storefront](https://chaotic-the-harmony-web.azurewebsites.net/)**
**🔐 [Admin Dashboard](https://chaotic-the-harmony-web.azurewebsites.net/admin/login)**

---

## Project Background: The Engineering Journey

This project represents a simulation of a real-world software lifecycle, evolving through multiple architectural iterations.

- **Evolution:** What began as a static Bootstrap prototype has been re-architected into a fully containerized, dynamic full-stack application.
- **Goal:** To build a system that prioritizes Data Integrity, Scalability, and Developer Experience (DX) over simple functionality.
- **Philosophy:** "Build it like it's real." This meant rejecting "Lorem Ipsum" placeholders in favor of a cohesive CTH brand strategy, realistic data seeding, and production-ready security patterns.

---

## Brand Identity & Data Strategy

Unlike standard demo projects, this application treats _"Chaotic The Harmony"_ as a real client requiring cohesive branding, assets, and complex data relationships.

### 🎸 The "CTH" Brand Concept

The name _"Chaotic The Harmony"_ is a nod to the real-world band _"Maximum The Hormone."_ The fictional band's surreal "ska-punk" persona draws inspiration from an eclectic mix of artists including _The Aquabats!_, _Awkwafina_, _Destroy Boys_, _Käärijä_, _Baby Lasagna_, _Creepy Nuts_, and the musical comedy of _Bo Burnham_, _Brian David Gilbert_, _Tom Cardy_, and _Farideh_. This diverse influence required a flexible content strategy to handle varied media types.

### 📊 Data Realism & Seeding

To ensure the database schema faced real-world challenges, I manually architected the product catalog rather than using random generators.

- **World Building:** I authored the band's entire discography (album themes, tracklists) and merch lines to test the **Content Management** capabilities of the system.
- **AI-Assisted Seeding:** Generative AI was used strictly as a "consultant" to identify gaps in the product lineup and to pattern-match realistic user personas for the **Order History** datasets.
- **Site copy (CMS):** Marketing and page blocks are seeded from multiple CSV files under `backend/src/main/resources/data/` (`cms_*.csv`, e.g. home, store, about, support). At runtime the API exposes this content to the storefront; the React app no longer reads a static CSV from `public/`.

### 🎨 Design System & Accessibility

**Aesthetic:** Neo-Brutalism inspired by the [Neubrutalism design trend](https://aesthetics.fandom.com/wiki/Neubrutalism).

- **Theme Credits:** [Accessible Color Palettes](https://shop.stephaniewalter.design/b/six-yellow-purple-accessible-color-palettes) created by [Stephanie Walter](https://stephaniewalter.design/):
  - _Admin Dashboard:_ "Soda Pop, pink strawberry edition"
  - _Customer Storefront:_ "Stephanie's Yellow with a vibrant purple twist"

#### Accessibility First

- **WCAG Compliance:** Implemented dual-color palettes using `ThemeContext` and CSS Modules to ensure sufficient contrast ratios.

#### Asset Strategy:

- **Original Artwork:** All unique assets—including the band's wordmark, album covers, and apparel designs—were created personally using **Affinity 3.0**. (WIP)
- **Licensing Standards:** I adhere to strict copyright standards. Fonts (e.g., _Daydream_) are used under valid desktop licenses, and stock media is sourced from royalty-free vendors (Pexels) or professional mockup providers (Creatsy).

---

## Architecture & Tech Stack

The project follows a **Microservices-ready Monolithic** structure (Monorepo split into `/backend` and `/frontend` directories), utilizing a **Docker-first** methodology.

### Infrastructure & DevOps
- **Cloud Provider:** Hosted on **Microsoft Azure** using **Azure App Service** (Linux Containers).
- **Container Registry:** Images are versioned and managed via **Azure Container Registry (ACR)**.
- **Database:** Managed **Azure Database for PostgreSQL (Flexible Server)**.
- **Continuous Deployment:** Automated **GitHub Actions** pipeline.
- **Self-Healing Automation:** To prevent demo "data drift," a GitHub Action performs a **"Nuclear Reset"** every 2 hours (wiping the schema via `psql` and triggering a rolling restart/re-seed of the API).

### Core Components

**Backend (The "Brain")**
- **Framework:** Java 21 + Spring Boot 3.4.2
- **Security:** Spring Security with **JWT** (Stateless Auth) and Role-Based Access Control (RBAC). Public **GET** access is allowed for read-only site content at `/api/v1/site-content` (see backend README).
- **Data Layer:** JPA/Hibernate with PostgreSQL.
- **Media Strategy:** Stateless architecture; images are offloaded to **Cloudinary** via API.

**Frontend (The "Face")**
- **Framework:** React + Vite
- **State Management:** Context API & Custom Hooks (including dedicated contexts for theme, authentication, cart, and site content).
- **Deployment:** Served via **Nginx** to handle client-side routing in a production environment.
- **API base URL:** Vite injects `VITE_API_URL` at **build time**. Docker Compose passes this when building the frontend image so the browser can reach the backend on the host.
- **Visual Feedback:** A custom **Demo Banner** provides users with a real-time countdown to the next automated system reset.

---

## Features

### 🛒 CTH Storefront (Public Customer View)
- **Dynamic Catalog:** Fetches "Active" products and related content.
- **Rich Content:** Displays artist bios, FAQs, and product details using **React-Markdown** where applicable.
- **API-driven copy:** Home, store, and other sections consume **site content blocks** from the backend API instead of a checked-in static CSV.
- **Store experience:** Structured store views (collections, browse sections, featured areas) with configuration-driven sections.
- **Account flows:** Customer login and sign-up views wired to the existing auth API patterns.
- **Self-Healing UI:** Informs users of the 2-hour reset cycle to ensure transparency of demo data.

### 🔐 Admin Dashboard (Internal IMS & CMS)
- **Hybrid Management:** Unified interface for **Hard Data** (Inventory/Stock) and **Soft Content** (News/Bios).
- **Media Management:** Direct integration with Cloudinary for asset lifecycle management.
- **Role-Based Security:** Protected routes ensuring only authenticated Admins access inventory controls.

---

## Current Status & Future Roadmap

- ✅ **Containerization:** Fully Dockerized production images (v7 Backend / v3 Frontend).
- ✅ **Cloud Infrastructure:** Migrated from local dev to **Azure Cloud**.
- ✅ **Automated Resilience:** GitHub Actions "Self-Heal" pipeline is live and stable.
- ✅ **Media Storage:** Integrated **Cloudinary** for scalable asset management.
- ✅ **CMS API:** Site copy is persisted in PostgreSQL, seeded from `cms_*.csv`, and served to the storefront via REST.
- 🚧 **Progressive Asset Implementation:** Assets are being integrated iteratively. To ensure accessibility and layout stability during development, placeholder SVGs with descriptive alt-text are used where final media is currently pending.
- 🚧 **Screen Reader friendly:** Keyboard navigation, focus management, and comprehensive alt-text coverage for screen readers are under active development.
- 🚧 **Storefront:** Finalizing the public checkout flow.
- ⏳ **Notifications:** Planned integration with **SendGrid** for order confirmations.
- ⏳ **Testing:** Expanding JUnit 5 test coverage for the Service Layer.

---

## 🏃‍♂️ Getting Started (Local Development)

You can run the full stack using Docker (recommended for speed) or manually if you need to debug specific services or work without containerization.

### ⚙️ Step 0: Configuration
Regardless of the method chosen, you must set up your environment variables:

1. **Duplicate the example file (repo root):**
   ```bash
   cp .env.example .env
   ```

2. **Update variables:** Add your DB credentials and Cloudinary keys. If keys are left blank, the system automatically defaults to Mock Mode, using local placeholder assets to ensure the app remains functional.

3. **Frontend API URL (manual `npm run dev` only):** Ensure `frontend/.env.development` defines `VITE_API_URL` (for example `http://localhost:8080/api/v1`). Vite reads this when you run the dev server. Do not commit secrets; use the same pattern in production via your deployment pipeline or `frontend/.env.production`.

---

### Option A: Local Quickstart (Docker Desktop)
The fastest way to see the app in action with a single command.

1. **Prerequisites**
   - Docker Desktop installed and running.

2. **Launch**  
   Build and start all services (Frontend, Backend, and Database) in detached mode:
   ```bash
   docker-compose up --build -d
   ```

3. **Access**
   - **Storefront:** http://localhost:3000 (Compose maps the Nginx container to host port `3000`)
   - **Backend API:** http://localhost:8080
   - **Database:** localhost:5432

---

### Option B: Local Manual Setup
Best for active development, hot-reloading, and deep debugging.

1. **Prerequisites**
   - **Java 21** (for the Spring Boot Backend)
   - **Node.js 20+** (for the React Frontend)
   - **PostgreSQL 16+** (if you prefer to run the database outside of Docker)

2. **Database**  
   Ensure a local Postgres instance is running with a database named `chaotic_the_harmony_dev` (matching your local profile settings).

3. **Backend (Spring Boot)**
   ```bash
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```

4. **Frontend (React/Vite)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access (manual)**  
   - **Storefront (Vite dev server):** http://localhost:5173  
   - **Backend API:** http://localhost:8080  

---

## 🔑 Demo Credentials

To simulate a high-volume production environment, the database is pre-seeded with **190+ users** (including 150 customers and 40 staff members) to demonstrate **Pagination**, **Filtering**, and **Role-Based Access Control (RBAC)**.

**Universal Password:** `pass123`

To explore specific roles, use these representative accounts:

| Role                 | Login Email                   | Access Capabilities                                                                     |
| :------------------- | :---------------------------- | :-------------------------------------------------------------------------------------- |
| **👑 SUPER_ADMIN**   | `ron.please@cth-store.com`    | **God Mode:** Full CRUD on Inventory, Users, Content, and System Settings.              |
| **🏪 STORE_MANAGER** | `dustin.okpik@cth-store.com`  | **Merchandising:** Can manage Products, Categories, Prices, and Marketing campaigns.    |
| **📦 WAREHOUSE**     | `ashra.dubois@cth-store.com`  | **Fulfillment:** Restricted view. Can only update Stock Levels and change Order Status. |
| **🎧 SUPPORT**       | `barnabus.kato@cth-store.com` | **CRM:** Can view Order History and edit Customer Profiles (cannot modify catalog).     |
| **📊 AUDITOR**       | `morgan.t@cth-store.com`      | **Read-Only:** Access to Dashboard Analytics and Financial Reports only.                |
| **👤 CUSTOMER**      | `keanu.p@yahoo.com`           | **Storefront:** Standard e-commerce access (Cart, Wishlist, Profile).                   |

> **💡 Exploration Tip:** You don't need to memorize these emails! Log in as the **Super Admin** to view and manage the full roster of 190+ users in the **Admin Dashboard > Users Tab**.

<p align="center">◕⩊◕<br>
<em>Thanks for checking out Chaotic The Harmony!</em>
</p>
