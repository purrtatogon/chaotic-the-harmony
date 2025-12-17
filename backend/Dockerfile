# --------------------
# Stage 1: Building the JAR file
# --------------------
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# --------------------
# Stage 2: Creating a minimal runtime image
# --------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Exposing the application port
EXPOSE 8080

# Running the application
ENTRYPOINT ["java", "-jar", "app.jar"]