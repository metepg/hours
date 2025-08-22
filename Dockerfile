# ---------- frontend ----------
FROM node:lts-alpine AS client
WORKDIR /client

COPY client/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY client/ .
RUN npm run build

# ---------- server ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY server/pom.xml server/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests -pl server -am dependency:go-offline

COPY server/ server/
COPY --from=client /client/dist client/dist/

RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests -pl server -am package

# ---------- runtime ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN adduser --system appuser
USER appuser
COPY --from=build /app/server/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
