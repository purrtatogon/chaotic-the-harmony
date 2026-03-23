# ⚙️ CTH API — Spring Boot Backend

This directory contains the **Java Spring Boot** application that serves as the "Brain" of the platform. It handles the **Inventory Management System (IMS)**, **Content Management System (CMS)** data for site copy, and **Role-Based Access Control (RBAC)**.

## 🛠 Tech Stack & Architecture

- **Core:** Java 21 + Spring Boot 3.4.2
- **Database:** Managed Azure PostgreSQL (Flexible Server) in production; PostgreSQL locally or in Docker
- **Security:** Spring Security + JWT (stateless auth). **Public read:** `GET /api/v1/site-content` and `GET /api/v1/site-content/**` are permitted without a token for storefront consumption.
- **Media:** Cloudinary API in production vs. mock placeholders locally when keys are absent
- **Resilience:** Automated "Nuclear Reset" via **GitHub Actions** (schema wipe + API restart + CSV re-seed on boot)

## 📂 Project Structure

Layered layout under package **`com.java.backend`**:

```text
backend/
├── src/main/java/com/java/backend/
│   ├── config/       # Security, CORS, Cloudinary, scheduled tasks (e.g. cleanup), …
│   ├── controller/   # REST controllers (products, orders, users, site-content, …)
│   ├── dto/          # Request/response DTOs
│   ├── exception/    # Global exception handling (@ControllerAdvice) where used
│   ├── model/        # JPA entities (e.g. products, users, site content entries)
│   ├── repository/   # Spring Data JPA repositories
│   └── service/      # Business logic, CsvSeederService, integrations
└── src/main/resources/
    ├── application-prod.properties
    ├── application-docker.properties
    ├── application-local.properties
    └── data/
        ├── cms_*.csv           # Site copy split by area (home, store, about, support, …)
        └── …                   # Other CSV seeds (products, users, orders, …)
```

### Site content API

- **Endpoint:** `GET /api/v1/site-content`
- **Behavior:** Returns a list of content blocks (section, key, title, body/markdown) merged from all `cms_*.csv` seeds into the `site_content_entries` table via `SiteContentEntry` at startup / re-seed.
- **Auth:** Anonymous **GET** allowed; admin JWT rules apply to protected IMS endpoints as before.

## ⚙️ Local Development

**1. Prerequisites**

- **Java:** JDK 21
- **PostgreSQL:** Running on port `5432` (or use Docker Compose from the repo root)

**2. Run**

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

API base: **http://localhost:8080** (e.g. **http://localhost:8080/api/v1/site-content**).

## 🐳 Azure & CI/CD Configuration

In production, the backend is hosted as a container on Azure App Service.

- **Deployment:** Triggered via `deploy.sh` or GitHub Actions.
- **Image versioning:** Current stable is `backend:v7`.
- **Self-healing:** The production reset is externalized to GitHub Actions to reduce database contention. The action drops the `public` schema on a schedule; on restart, **`CsvSeederService`** reloads CSV data (including **`cms_*.csv`**) into PostgreSQL.

<p align="center">◕⩊◕<br>
<em>Thanks for checking out the Backend!</em>
</p>
