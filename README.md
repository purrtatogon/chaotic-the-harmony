# Chaotic The Harmony

A full-stack e-commerce and inventory management platform for the fictional ska-punk band "Chaotic The Harmony" (CTH). The admin side — CTH // BACKLINE — manages inventory, users, and product data. The customer side will eventually serve the band's online store.

Built with **Java Spring Boot**, **React**, and **PostgreSQL**.

> Work in progress — just the scaffolding for now.

## Tech Stack

| Layer | Stack |
| :--- | :--- |
| Backend | Java 21, Spring Boot 3.4.2, Spring Security, JPA/Hibernate, PostgreSQL |
| Frontend | React, Vite |
| Infrastructure | Docker, Docker Compose |

## Getting Started

```bash
cp .env.example .env
docker-compose up --build -d
```

| Service | URL |
| :--- | :--- |
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| PostgreSQL | localhost:5432 |
