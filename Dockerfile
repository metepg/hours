# ---------- frontend ----------
FROM node:lts-alpine AS client
WORKDIR /client

COPY client/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY client/ .
RUN npm run build

# ---------- server ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app/server

COPY server/pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests dependency:go-offline

COPY server/ .

# copy built frontend to backend
COPY --from=client /client/dist ./src/main/resources/static/

RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests package

# ---------- runtime ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN adduser --system appuser
USER appuser
COPY --from=build /app/server/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
