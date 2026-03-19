# 🛍️ CTH Admin Dashboard & Storefront — React Client

This directory contains the **React/Vite** application that serves as the "Face" of the Unified Commerce Platform. It features a sophisticated **Dual-Theme System** (Admin Dashboard vs. Customer Storefront) and utilizes a **Neo-Brutalist** design aesthetic.

## 🛠 Tech Stack & Architecture

- **Core:** React 18 + Vite
- **Routing:** React Router v6 (Protected Admin Routes)
- **HTTP Client:** Axios (Interceptors for JWT handling)
- **Content Rendering:** `react-markdown` (Safe rich-text rendering for product descriptions)
- **Styling:** CSS Modules + `ThemeContext` (Dynamic variable switching)
- **Visuals:** Custom **Demo Banner** with UTC-based countdown for system resets.

## 📂 Project Structure

The project follows a scalable "Feature-driven" directory structure:

```text
/frontend
├── /src
│   ├── /assets        # Global styles, fonts (Daydream), and images
│   ├── /components    # Reusable UI (Buttons, Cards, Inputs)
│   ├── /context       # Global State (ThemeContext, AuthContext, CartContext)
│   ├── /hooks         # Custom Hooks (useProduct, useAuth, useLocalStorage)
│   ├── /layout        # Layout wrappers (AdminLayout vs. MainLayout)
│   ├── /pages         # Page Views
│   │   ├── /admin     # Protected IMS/CMS views
│   │   └── /public    # Customer storefront views
│   ├── /services      # Axios config (Production URL: Azure App Service)
│   ├── /utils         # Formatters (Currency, Date) and Validators
│   └── main.jsx       # App Entry Point
├── Dockerfile         # Multi-stage build (Node 20 build -> Nginx serve)
└── nginx.conf         # Production routing for SPA support
```

## ⚙️ Local Development

**1. Prerequisites**

- **Node.js:** v20+ (LTS)
- **Backend:** Spring Boot API running on `localhost:8080`.

**2. Setup**

```bash
npm install
npm run dev
```

Start at http://localhost:5173.

---

## 🐳 Production & Docker

In production (Azure), the app is containerized and served via Nginx.

- **Image Versioning:** Managed via ACR (e.g., ** `frontend:v3`).
- **Internal Port:** `80` (Nginx default).
- **Exposed Host Port:** `3000` (Docker Compose) or `80/443` (Azure).


<p align="center">◕⩊◕<br>
<em>Thanks for checking out the Frontend!</em>
</p>
