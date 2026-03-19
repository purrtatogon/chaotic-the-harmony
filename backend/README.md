# ⚙️ CTH API — Spring Boot Backend

This directory contains the **Java Spring Boot** application that serves as the "Brain" of the platform. It handles the **Inventory Management System (IMS)**, **Content Management System (CMS)**, and **Role-Based Access Control (RBAC)**.

## 🛠 Tech Stack & Architecture

- **Core:** Java 21 + Spring Boot 3.4.2
- **Database:** Managed Azure PostgreSQL (Flexible Server)
- **Security:** Spring Security + JWT (Stateless Auth)
- **Media Strategy:** Cloudinary API (Production) vs. Mock placeholders (Local).
- **Resilience:** Automated "Nuclear Reset" via **GitHub Actions** (Schema wipe + API restart).

## 📂 Project Structure

The codebase follows a clean Layered Architecture:

```text
/backend
├── /src/main/java/com/cth/bandstore
│   ├── /config       # Security, CORS, and Cloudinary Configuration
│   ├── /controller   # REST Endpoints (API Layer)
│   ├── /dto          # Data Transfer Objects (Request/Response shapes)
│   ├── /exception    # Global Exception Handlers (@ControllerAdvice)
│   ├── /model        # JPA Entities (PostgreSQL Schema)
│   ├── /repository   # Data Access Layer (Hibernate interfaces)
│   ├── /service      # Business Logic & CsvSeederService
│   └── /tasks        # Internal maintenance (Local scheduler only)
└── /src/main/resources
    ├── application-prod.properties   # Azure/Production settings
    ├── application-docker.properties # Docker Override
    ├── application-local.properties  # Local Dev Override
    └── /data                         # CSV Datasets for re-seeding
```

## ⚙️ Local Development

**1. Prerequisites**

- **Java:** JDK 21
- **PostgreSQL:** Running locally on port `5432`.

**2. Run the App**
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

API available at **http://localhost:8080**.

## 🐳 Azure & CI/CD Configuration

In production, the backend is hosted as a container on Azure App Service.

- **Deployment:** Triggered via `deploy.sh` or GitHub Actions.
- **Image Versioning:** Current stable is `backend:v7`.
- **Self-Healing:** The production reset is externalized to GitHub Actions to prevent database deadlocks. The Action drops the `public` schema every 2 hours, and the Spring Boot `CsvSeederService` automatically re-populates the data upon container restart.

<p align="center">◕⩊◕<br>
<em>Thanks for checking out the Backend!</em>
</p>
