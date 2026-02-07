# ⚙️ CTH API — Spring Boot Backend

This directory contains the **Java Spring Boot** application that serves as the "Brain" of the platform. It handles the **Inventory Management System (IMS)**, **Content Management System (CMS)**, and **Role-Based Access Control (RBAC)**.

## 🛠 Tech Stack & Architecture

- **Core:** Java 21 + Spring Boot 3.4
- **Database:** PostgreSQL + Spring Data JPA
- **Security:** Spring Security + JWT (Stateless Auth)
- **Media Strategy:**
  - **Production:** Cloudinary (via API)
  - **Local/Mock:** Placeholder Images (if API keys are missing)
- **Resilience:** Scheduled "Self-Healing" tasks to reset demo data.

## 📂 Project Structure

The codebase follows a clean Layered Architecture:

```text
/backend
├── /src/main/java/com/cth/bandstore
│   ├── /config       # Security, CORS, and Cloudinary Configuration
│   ├── /controller   # REST Endpoints (API Layer)
│   ├── /dto          # Data Transfer Objects (Request/Response shapes)
│   ├── /exception    # Global Exception Handlers (@ControllerAdvice)
│   ├── /model        # JPA Entities (Database Schema)
│   ├── /repository   # Data Access Layer (Hibernate interfaces)
│   ├── /service      # Business Logic (Mock vs. Real implementations)
│   └── /tasks        # @Scheduled tasks (Database Cleanup/Reset)
└── /src/main/resources
    ├── application.properties        # Shared Config
    ├── application-docker.properties # Docker Override
    ├── application-local.properties  # Local Dev Override
    └── /data                         # CSV Seeding Data
```

## ⚙️ Local Development

You can run the backend in "Mock Mode" (Offline) or "Connected Mode" (Cloudinary).

**1. Prerequisites**

- **Java:** JDK 21
- **PostgreSQL:** Running locally on port `5432`.

**2. Configuration (Environment)**

The app checks for a `.env` file (or system env vars) for secrets.

- **Mock Mode:** If you do not provide `CLOUDINARY_API_KEY`, the app automatically falls back to local placeholder images.
- **Connected Mode:** Add your keys to the root `.env` file to enable real image uploads.

**3. Run the App**
Use the local profile to connect to your localhost database:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The API will be available at **http://localhost:8080**.

## 🐳 Docker Configuration

When running via the root docker-compose.yml:

- **Internal Port:** `8080`
- **Profile:** Automatically activates the docker profile.
- **Database:** Connects to the `db` container (not localhost).
- **Self-Healing:** The `prod` profile activates the 20-minute database reset timer (disabled in local profile).

<p align="center">◕⩊◕<br>
<em>Thanks for checking out the Backend!</em>
</p>
