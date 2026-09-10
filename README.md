# ecommerce-admin-frontend

Admin panel dashboard (Next.js). Shows products, categories and users by
consuming the [backend](../ecommerce-admin-backend)'s API. Renders 100%
client-side (`"use client"` in [`app/page.tsx`](app/page.tsx)) on purpose:
that way the same build works whether it's served by Next.js (local dev)
or exported to static files and served from S3 (no server behind it).

Part of a 3-repo project — see
[`ecommerce-admin-infra`](../ecommerce-admin-infra) for the overall
architecture and how to bring everything up together.

## Running with Docker (recommended)

This repo has its own `docker-compose.yml` and starts **independently** —
it doesn't build or need `ecommerce-admin-infra`'s or
`ecommerce-admin-backend`'s compose files. Bring up infra, then backend
first (see their READMEs), then, from here:

```bash
docker compose up
```

Dashboard at http://localhost:3000.

## Running standalone (outside Docker)

```bash
npm install

export NEXT_PUBLIC_API_URL=http://localhost:4000  # backend running separately
export FRONTEND_PORT=3000

npm run dev
```

## Building as a static export (for S3 deployment)

This is the flow `ecommerce-admin-infra/scripts/deploy-frontend.sh` would
use — no need to run it by hand normally:

```bash
STATIC_EXPORT=true NEXT_PUBLIC_API_URL=<backend-url> npm run build
# generates ./out/ ready to upload to an S3 bucket (LocalStack or real AWS)
```

`STATIC_EXPORT=true` turns on `output: "export"` in
[`next.config.js`](next.config.js) — without that variable, `npm run build`
produces the normal server build (the one the `docker compose up`
container uses).

## Environment variables

| Variable | Local (Docker Compose default) | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | URL the **browser** uses to call the backend — has to be reachable from the visitor's machine, not just from inside Docker |
| `FRONTEND_PORT` | `3000` | Dev server port |
| `STATIC_EXPORT` | *(unset in dev)* | `true` only when exporting statically for S3 |

## npm scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server (hot-reload) |
| `npm run build` | Build (server or static export, based on `STATIC_EXPORT`) |
| `npm run start` | Runs the server build |
| `npm run lint` | Lint |

## Structure

```
app/page.tsx        Dashboard (stats + products table)
app/layout.tsx      Root layout
lib/api.ts          HTTP client to the backend (single source of the base URL)
docker-compose.yml  Runs this service on its own (see "Running with Docker" above)
```

## Deployment

[`Jenkinsfile`](Jenkinsfile): lint, build, Docker image build (uses
[`Dockerfile.ci`](Dockerfile.ci) — see [`railway.json`](railway.json)) and
deploy to Railway. Runs as an independent Jenkins job (see
`ecommerce-admin-infra/jenkins/README.md`).

For the deploy stage to work, you need:

1. A Railway project with a service for this frontend (image/build via
   Dockerfile, see `railway.json`), with `NEXT_PUBLIC_API_URL` pointing at
   the backend's Railway URL.
2. A Railway **Project Token** (Railway dashboard → project →
   Settings → Tokens).
3. In Jenkins: a **Secret text** credential, id `railway-token-frontend`,
   value = that token.

If the Railway service name isn't `ecommerce-admin-frontend`, adjust
`RAILWAY_SERVICE` in the `Jenkinsfile`.
