# 🛍️ CTH Admin Dashboard & Storefront — React Client

This directory contains the **React/Vite** application that serves as the "Face" of the Unified Commerce Platform. It features a sophisticated **Dual-Theme System** (Admin Dashboard vs. Customer Storefront) and utilizes a **Neo-Brutalist** design aesthetic.

## 🛠 Tech Stack & Architecture

- **Core:** React 18 + Vite
- **Routing:** React Router v6 (Protected Admin Routes)
- **HTTP Client:** Axios (Interceptors for JWT handling)
- **Content Rendering:** `react-markdown` (Safe rich-text rendering for product descriptions)
- **Styling:** CSS Modules + `ThemeContext` (Dynamic variable switching)

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
│   ├── /services      # Axios configuration & API endpoints
│   ├── /utils         # Formatters (Currency, Date) and Validators
│   └── main.jsx       # App Entry Point
├── Dockerfile         # Multi-stage build for Nginx serving
└── vite.config.js     # Proxy & Build configuration
```

## ⚙️ Local Development

If you are developing UI features without running the full Docker stack:

**1. Prerequisites**

- **Node.js:** v20+ (LTS)
- **Backend:** Ensure the Spring Boot API is running on `localhost:8080`.

**2. Installation**

```bash
npm install
```

**3. Run Dev Server**

```bash
npm run dev
```

The application will start at http://localhost:5173.

---

## 🐳 Docker Configuration

When running via the root `docker-compose.yml`, the networking is handled automatically.

- **Internal Container Port:** `5173`
- **Exposed Host Port:** `3000`
- **Access URL:** http://localhost:3000

**Note:** We map the internal Vite port to 3000 on the host machine to avoid conflicts with other local development servers and to simulate a production build port.

<p align="center">◕⩊◕<br>
<em>Thanks for checking out the Frontend!</em>
</p>
