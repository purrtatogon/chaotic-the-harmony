# ⚙️ CTH Store - Backend API

This directory contains the Java Spring Boot application that handles business logic, database persistence, and security for the CTH Band Store.

## 🛠 Tech Stack

- **Language:** Java 21
- **Framework:** Spring Boot 3.x (Maven)
- **Database:** PostgreSQL
- **Key Dependencies:**
  - Spring Web (REST API)
  - Spring Data JPA (Hibernate)
  - Spring Security

## ⚙️ Local Development (Non-Docker)

If you are working on API logic without the full Docker stack, follow these steps.

### Prerequisites

- **Java:** JDK 21
- **Maven:** 3.9+
- **PostgreSQL:** Running locally on port 5432

### Configuration Profiles

This application uses Spring Profiles to manage environments:

1.  **`application-docker.properties`:** Active when running in Docker. Connects to the containerized DB.
2.  **`application-local.properties`:** Active for local dev. Connects to `localhost:5432`.

### Running Locally

To run the app using the local profile:

```bash
# From the /backend directory
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The API will be available at http://localhost:8080.

Docker Configuration
When running via the root docker-compose.yml:

Port: 8080

Build: Multi-stage Dockerfile

Profile: Automatically activates the docker profile.

## Project Structure WIP WIP WIP

/backend
├── /src
│ ├── /main/java/com/cth/bandstore
│ │ ├── /config # Security configuration
│ │ ├── /controller # REST Endpoints
│ │ ├── /model # JPA Entities
│ │ ├── /repository # Data Access Layer
│ │ └── /service # Business Logic
│ └── /resources
│ ├── application.properties
│ ├── application-docker.properties
│ └── application-local.properties
└── Dockerfile
