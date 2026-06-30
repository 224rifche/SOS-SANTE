# ============================================================================
# WON-MALLY API - Dockerfile multi-stage
# ============================================================================
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S wonmally && adduser -S wonmally -G wonmally
COPY --from=build /app/target/wonmally-api.jar app.jar
USER wonmally
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
