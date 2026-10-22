---
name: docker-best-practices
description: "Small, secure Dockerfiles (multi-stage, non-root, pinned) and docker-compose for dev. Use when containerising."
---

# Docker best practices

## Dockerfile checklist
- [ ] Multi-stage: build stage with SDK, runtime stage with minimal image (slim/alpine/distroless/chiseled)
- [ ] Base image pinned to a specific version (and ideally digest); never `latest`
- [ ] Copy dependency manifests and restore **before** copying source (cache)
- [ ] `.dockerignore` excludes `.git`, `node_modules`, `bin/obj`, build outputs, `.env`, secrets
- [ ] Runs as a non-root user
- [ ] No secrets in `ARG`/`ENV`/layers - use BuildKit secrets (`--mount=type=secret`)
- [ ] `HEALTHCHECK` or orchestrator probes
- [ ] Exec-form `ENTRYPOINT ["..."]` so signals reach the process
- [ ] One process per container; logs to stdout/stderr
- [ ] Labels: source repo, version, revision (OCI labels)

## Example (.NET)
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY *.sln ./
COPY src/Api/Api.csproj src/Api/
RUN dotnet restore src/Api/Api.csproj
COPY . .
RUN dotnet publish src/Api/Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0-noble-chiseled
WORKDIR /app
COPY --from=build /app .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "Api.dll"]
```

## Example (Node)
```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## docker-compose for local dev
- Services for app dependencies (db, cache, broker) with named volumes and health checks.
- `depends_on: { db: { condition: service_healthy } }`.
- Config via `.env` (committed `.env.example`, never the real `.env`).

## Verify
`docker build --progress=plain .`, check size with `docker images`, scan with `trivy image <img>`, inspect layers with `dive`.
