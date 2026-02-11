# Chaotic The Harmony — Full-Stack E-Commerce Platform

A production-grade **Unified Commerce Platform (UCP)** for the fictional ska-punk band _"Chaotic The Harmony"_ (CTH). This solution merges a complex **Inventory Management System (IMS)** with a custom **Content Management System (CMS)**, built with **React**, **Java Spring Boot**, and **PostgreSQL**.

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

The project follows a **Microservices-ready Monolithic** structure (Monorepo split into `/backend` and `/frontend` directories), utilizing a **Docker-first** methodology for consistent development and deployment environments.

### Infrastructure & DevOps

- **Containerization:** Fully orchestrated via Docker Compose (Frontend, Backend, Database).
- **Environment Strategy:**
  - **Local Dev:** Uses **Mock Services** and a local PostgreSQL container for safe, offline development. (WIP)
  - **Production:** Deploys to **Render** with a managed PostgreSQL instance and auto-scaling capabilities. (WIP)
  - **Continuous Deployment:** Automated pipeline from GitHub to Render. (WIP)

### Core Components

**Backend (The "Brain")**

- **Framework:** Java 21 + Spring Boot 3
- **Security:** Spring Security (Role-Based Access Control).
- **Data Layer:** JPA/Hibernate with PostgreSQL.
- **Media Strategy:** **Stateless Architecture**. Images are offloaded to **Cloudinary** (via API) to ensure lightweight containers and faster build times.
- **Resilience:** Implemented a **"Self-Healing"** database routine (`@Scheduled` task) that resets the demo environment every 20 minutes to prevent data drift. (WIP)

**Frontend (The "Face")**

- **Framework:** React + Vite
- **State Management:** Context API & Custom Hooks.
- **Content Rendering:** **React-Markdown** for secure, rich-text product descriptions (preserving formatting without the security risks of raw HTML).
- **Styling:** CSS Modules with a Neo-Brutalism design system.

---

## Features

### 🛒 CTH Storefront (Public Customer View)

- **Dynamic Catalog:** Fetches "Active" products and "Published" news articles from the backend.
- **Rich Content:** Displays formatted artist bios and product details using Markdown parsing.
- **Read-Only Access:** Secured public endpoints that allow browsing but restrict transaction/modification capabilities.

### 🔐 Admin Dashboard (Internal IMS & CMS)

- **Hybrid Management:** A unified interface for managing both **Hard Data** (Inventory, Stock Levels, Prices) and **Soft Content** (News, Artist Bios).
- **Smart Editing:**
  - **Product Names:** Restricted to plain text to enforce SEO-friendly URL slugs and clean search indexing.
  - **Descriptions:** Markdown-enabled editor allowing bold, italics, and bullet points for rich presentation.
- **Media Management:** Direct integration with Cloudinary for uploading/deleting product assets.
- **Role-Based Security:** Protected routes ensuring only authenticated Admins can access sensitive inventory controls.
- **Note on Architecture:** _In a large-scale enterprise environment, I would typically offload static content (Bios/Blogs) to a Headless CMS (like Contentful). However, for this project, I engineered a custom CMS layer within Spring Boot to demonstrate complex relationship mapping and full-stack CRUD proficiency._

---

## Current Status & Future Roadmap

- ✅ **Containerization:** Fully Dockerized local environment!
- ✅ **Media Storage:** Integrated **Cloudinary** for scalable asset management!
- 🚧 **Progressive Asset Implementation:** Assets are being integrated iteratively. To ensure accessibility and layout stability during development, placeholder SVGs with descriptive alt-text are used where final media is currently pending.
- 🚧 **Screen Reader friendly:** Keyboard navigation and comprehensive alt-text coverage for screen readers are currently under active development.
- 🚧 **CTH Storefront:** Currently under active development.
- 🚧 **Deployment:** Configuring **Render** for live hosting with "Self-Healing" database scripts.
- ⏳ **Notifications:** Planned integration with **SendGrid** for transactional emails (Order Confirmations).
- ⏳ **Testing:** Expanding JUnit test coverage for the Service Layer.

---

# 🚀 Getting Started

Because this project follows a **Docker-first** methodology, you can run the entire stack with minimal setup.

## Prerequisites

### Option A: Docker (Recommended)

The **only** requirement to spin up the full application (Frontend, Backend, and Database) is:

- **Docker Desktop** (Latest stable version)
- _Ensure the Docker daemon is running._

### Option B: Local Manual Setup

If you wish to run services individually for debugging, ensure you have:
| Component | Requirement | Context |
| :--- | :--- | :--- |
| **Java** | JDK 21 | Spring Boot Backend |
| **Node.js** | v20+ (LTS) | React Frontend |
| **PostgreSQL** | v16+ | If running DB outside Docker |

---

## ⚙️ Configuration (Environment Variables)

This project uses a `.env` file to manage secrets (DB passwords, Cloudinary keys) without committing them to GitHub.

1.  **Duplicate the example file:**
    ```bash
    cp .env.example .env
    ```
2.  **Update the variables (Optional):**
    - If you have a Cloudinary account, add your `CLOUDINARY_API_KEY` in the `.env` file.
    - **Mock Mode:** If you leave the Cloudinary keys **blank**, the application will automatically detect this and switch to **"Mock Mode"** (using local placeholder images), ensuring the app never crashes for new users.

---

## 🏃‍♂️ Run the Application

### Method 1: Docker (Quickstart)

This is the fastest way to see the app in action.

**0. Create the env file (Defaults are fine for Mock Mode)**

```bash
cp .env.example .env
```

**1. Build and start all services in detached mode**

```bash
docker-compose up --build -d
```

Once running, access the services (WIP):

| Service         | URL                   | Notes                                         |
| :-------------- | :-------------------- | :-------------------------------------------- |
| **Storefront**  | http://localhost:3000 | Mapped from internal port 5173                |
| **Backend API** | http://localhost:8080 | Swagger UI available at /swagger-ui.html      |
| **Database**    | localhost:5432        | User: postgres / Pass: bandstoredb123postgres |

### Method 2: Manual (Non-Docker)

Use this if you need to debug specific services or lack Docker resources.

**1. Database**
Ensure you have a local Postgres instance running, or just spin up the DB container:

```bash
docker-compose up db -d
```

**2. Backend (Spring Boot)**

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**3. Frontend (React/Vite)**

```bash
cd frontend
npm install
npm run dev
```

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
