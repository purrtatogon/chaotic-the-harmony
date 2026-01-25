# 🛍️ CTH Storefront - Frontend

This directory contains the React/Vite application that serves as the UI for the CTH Band Store. It features a dual-theme system (Admin/Customer) and follows a Neo-Brutalist design aesthetic.

## 🛠 Tech Stack

- **Framework:** React (Vite)
- **Routing:** React Router
- **HTTP Client:** Axios
- **Styling:** CSS Modules, ThemeContext (Neo-brutalism)

## ⚙️ Local Development (Non-Docker)

If you are developing features for the UI without running the full Docker stack, follow these steps.

### Prerequisites

- **Node.js:** v20+ (LTS)
- **npm:** Included with Node

### Installation

```bash
# From the /frontend directory
npm install
```

### Running Development Server

```bash
npm run dev
```

The application will start at http://localhost:5173.

Note: Ensure your backend is running (either via Docker or locally on port 8080) for API requests to work.

Docker Configuration
When running via the root docker-compose.yml:

Internal Port: 5173

Host Port: 3000 (Access at http://localhost:3000)

Note: We map the internal Vite port to 3000 on the host to avoid conflicts.

## Project Structure WIP WIP WIP

/frontend
├── /src
│ ├── /assets # Images, Fonts, Global CSS
│ ├── /components # Reusable UI components
│ ├── /context # ThemeContext and global state
│ ├── /pages # Page views (Admin/Customer)
│ ├── /services # Axios configuration
│ └── main.jsx # Entry point
├── Dockerfile
└── vite.config.js
