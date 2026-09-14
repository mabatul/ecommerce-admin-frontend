# CLAUDE.md

Context for Claude Code (or any AI assistant) working in this repo.

## What this repo is

`ecommerce-admin-frontend` is one of **three independent repos** that make
up the ecommerce-admin project:

- **ecommerce-admin-infra** — infrastructure only (CloudFormation,
  LocalStack, deployment scripts). Its `docker-compose.yml` brings up
  LocalStack only. Lives in a sibling folder, `../ecommerce-admin-infra`.
- **ecommerce-admin-backend** — the Next.js API this frontend consumes.
  Starts independently, with its own `docker-compose.yml`.
- **ecommerce-admin-frontend** (this repo) — the Next.js dashboard. Also
  starts independently, with its own `docker-compose.yml`.

This repo never talks to AWS/LocalStack/DynamoDB directly — it only makes
HTTP calls to the backend, via `lib/api.ts`. It doesn't depend on
`ecommerce-admin-infra`'s or `ecommerce-admin-backend`'s compose files to
start — `docker-compose.yml` here only defines the `frontend` service. See
`ecommerce-admin-infra/README.md` for the full bring-up sequence.

## Key design decisions (don't undo these without a reason)

- **Everything renders client-side on purpose** (`"use client"` in
  `app/page.tsx`). This repo also builds as a static export
  (`STATIC_EXPORT=true`) for S3 deployment, where there's no server to
  fetch data at request time — server-rendering data here would break that
  path.
- **The backend URL is never hardcoded** — always `NEXT_PUBLIC_API_URL`.
  Note it's a build-time value for Next.js (`NEXT_PUBLIC_*` vars get
  inlined into the client bundle), so it has to be set correctly at
  `docker build` / `npm run build` time, not just at runtime.
- **Two Dockerfiles, different jobs** — same split as the backend repo.
  `Dockerfile` for local dev (`next dev`, bind-mounted code),
  `Dockerfile.ci` for CI/Railway (production build baked in with `COPY`).
- **This repo deploys independently.** Its `.github/workflows/ci.yml`
  builds, lints, and deploys to Railway on its own — it doesn't wait for or
  depend on infra/backend's pipelines.

## Conventions across all three repos

- Documentation (README, code comments): **English**, even though
  conversations about this project may happen in Spanish.
- Commit messages: plain-language summaries of what changed (not
  Conventional Commits prefixes like `feat:`/`chore:`).
- Don't fabricate commit timestamps/history to make automated work look
  like it happened incrementally over time it didn't.

## Where to look for more detail

- `README.md` — how to run standalone or as part of the full environment,
  static export, deployment.
- `ecommerce-admin-infra/README.md` — overall architecture, all 3 repos.
