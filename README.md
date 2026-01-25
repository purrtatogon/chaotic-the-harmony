# band-store-cth: Full-Stack Application

A comprehensive e-commerce and inventory management platform for the fictional ska-punk band _"Chaotic The Harmony"_ (CTH). Built with **React**, **Java Spring Boot**, and **PostgreSQL**.

---

## Project Background: The Evolution

This project represents a journey of continuous iteration and architectural growth.

- **Origins:** It began as a front-end bootcamp assignment—a static website built with Bootstrap 5.
- **Refactoring:** Over several months, I completely re-architected the solution multiple times to transition from a static site to a dynamic, containerized full-stack application.
- **Goal:** To simulate a real-world production environment, prioritizing data integrity, scalability, and clean code principles.

## The "CTH" Brand & Creative Process

Unlike standard demo projects populated with "Lorem Ipsum," I treated this as a real product launch requiring cohesive branding, assets, and data.

### The Fictional Band

The name _"Chaotic The Harmony"_ is a nod to the real-world band _"Maximum The Hormone."_ The band's surreal "ska-punk" persona draws inspiration from an eclectic mix of artists including _The Aquabats!_, _Mustard Plug_, _Destroy Boys_, _Creepy Nuts_, and the musical comedy of _Bo Burnham_, _Brian David Gilbert_, and _Tom Cardy_.

### Content Strategy & Data Realism

To ensure the database felt authentic, I manually architected the product catalog:

- **World Building:** I imagined and created the band's discography (album names, themes, tracks, and descriptions) and merchandise lines.
- **Data Generation:** I established three primary product categories and designed realistic user personas and order histories.
- **AI as a Tool:** Generative AI was used strictly as a "consultant" to identify gaps in my product lineup (e.g., "Is this merch theme missing a hat?") and to help pattern-match email addresses for demo users.

### Original Artwork & Design

- **Design Tools:** All unique artwork—including the band's wordmark, album covers, apparel designs, and accessory graphics—was personally created by me using **Affinity 3.0**.
- **Implementation:** These assets are being progressively integrated into the frontend as they are finalized.

### Licensing & Asset Integrity

I adhere to strict copyright standards for all third-party assets:

- **Stock Media:** Royalty-free images sourced from Pexels.
- **Mockups:** Professional product mockups purchased from vendors like Creatsy.
- **Typography:** Fonts (e.g., _Daydream_) are used under valid desktop licenses purchased from Volcano Type.

# Architecture & Tech Stack

This project is structured as a **monorepo** (split into `/backend` and `/frontend` directories) and was built using a **Docker-first methodology**. The development environment is fully containerized, utilizing three orchestrated services to ensure consistency across machines.

## Containerization & Infrastructure

- **Docker Desktop:** Orchestrates the multi-container setup.
- **Services:**
  - **Frontend Container:** React/Vite (Port `5173`)
  - **Backend Container:** Spring Boot (Port `8080`)
  - **Database Container:** PostgreSQL (Port `5432`)

## Core Components

**Backend**

- **Language:** Java 21
- **Framework:** Spring Boot (Maven)
- **Key Libraries:** Spring Security, JPA/Hibernate
- **Architecture:** RESTful API

**Frontend**

- **Framework:** React (Vite)
- **Routing:** React Router
- **HTTP Client:** Axios

**Database**

- **System:** PostgreSQL

---

## Features

### CTH Storefront (Customer View)

- 🚧 **Status:** Currently under active development.

### CTH Store Admin (Inventory System)

- **Admin Dashboard:** Comprehensive overview of store metrics.
- **User Management:** Integrated with **UI Avatars** for dynamic profile generation.
- **Inventory Control:** Full CRUD capabilities for Products and Categories.
- **Placeholders:** UI prepared for future Order and Warehouse management modules.

### Design & Accessibility

**Aesthetic: Neo-Brutalism**

- High-contrast, raw aesthetic inspired by the [Neo-brutalism design trend](https://aesthetics.fandom.com/wiki/Neubrutalism).
- **Accessibility First:**
  - **WCAG-Compliant Color Palettes:** implemented dual-color palettes using `ThemeContext` and CSS Modules.
  - **Keyboard Navigation:** Fully navigable via keyboard (WIP).
  - **Screen Readers:** All images include dynamic alt text (WIP).

**Theme Credits:**

- _Admin Theme:_ "Soda Pop, Pink Strawberry Edition" (by Stephanie Walter)
- _Customer Theme:_ "Stephanie's Yellow" with a purple twist (by Stephanie Walter)

---

## Roadmap & Next Steps

- **Deployment:** Investigating **Render** (Static Site for React, Web Service for Spring Boot).
- **Media Storage:** Evaluating Cloudinary for scalable asset management. Note: User-generated image uploads are currently deferred pending the implementation of robust security protocols (malware scanning and input sanitization).
- **Notifications:** Investigating **SendGrid** for transactional emails.

# Prerequisites & Local Setup

Because this project follows a **Docker-first** methodology, you can run the entire stack with minimal setup.

### Option A: Run via Docker (Recommended)

The **only** requirement to spin up the full application (Frontend, Backend, and Database) is:

- **Docker Desktop** (Latest stable version)
- _Ensure the Docker daemon is running._

### Option B: Local Development (Non-Docker)

If you wish to run the services individually for debugging or contribution, ensure you have the following installed on your host machine:

| Component    | Requirement    | Context                          |
| :----------- | :------------- | :------------------------------- |
| **Java**     | JDK 21         | Required for Spring Boot Backend |
| **Node.js**  | v20+ (LTS)     | Required for React Frontend      |
| **Database** | PostgreSQL 16+ | If running DB outside of Docker  |
| **Maven**    | v3.9+          | Backend dependency management    |

---

# Getting Started

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/band-store-cth.git](https://github.com/your-username/band-store-cth.git)
cd band-store-cth
```

### 2. Run with Docker (Quickstart)

This is the fastest way to see the app in action. It uses the application-docker.properties profile for the backend.

```bash
# Build and start all services in detached mode
docker-compose up --build -d
```

Once the containers are running, you can access the services at:

| Service         | URL                   | Credentials (if applicable)                   |
| :-------------- | :-------------------- | :-------------------------------------------- |
| **Frontend**    | http://localhost:3000 | N/A                                           |
| **Backend API** | http://localhost:8080 | N/A                                           |
| **Database**    | localhost:5432        | User: postgres / Pass: bandstoredb123postgres |

Note: The frontend container exposes port 5173 internally, but we map it to 3000 on your host machine to avoid conflicts!

To stop the application:

```bash
docker-compose down
```

### 3. Run Locally (Manual Setup)

Use this method if you need to debug specific services without Docker.

### A. Database

Ensure you have a local PostgreSQL instance running on port 5432 with a database named bandstoredb, or simply keep the Docker database running:

```bash
docker-compose up db -d
```

### B. Backend (Spring Boot)

The application is configured to use the local profile (application-local.properties) when running outside of Docker.

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The Server will start on http://localhost:8080

### C. Frontend (React/Vite)

```bash
cd frontend
npm install
npm run dev
```

The Client will start on http://localhost:5173 (Default Vite Port)

<p align="center">
  **◕⩊◕**<br>
  Thanks for stopping by! | Obrigada! | 見てくれてありがとう！
</p>
