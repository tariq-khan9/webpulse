# WebPulse

Uptime-monitoring SaaS (pnpm monorepo). Users register URLs to monitor; a background
worker checks them periodically and records status/incidents/uptime history; alerts
fire on state changes; access is gated by a Stripe-backed subscription tier.

## Structure

- `apps/web` — Next.js 16 / React 19 frontend. Better Auth (email/password with
  verification, Google, password reset) via `src/lib/auth.ts`, landing page,
  `(dashboard)` routes, Stripe billing. Tailwind 4, react-hook-form + zod.
- `apps/worker` — BullMQ (Redis) background worker that performs the uptime checks,
  records incidents, sends alerts, and runs the nightly uptime rollup.
- `shared` (`@webpulse/shared`) — Prisma schema/migrations and client factory, Redis
  and queue helpers, email sender, shared types; consumed by both `web` and `worker`.
- `shared/prisma` — schema: Better Auth tables (`users`, `sessions`, `accounts`,
  `verifications`) plus `monitors`, `incidents`, `uptime_daily`, `subscriptions`,
  `alerts`. Hand-written SQL in the migrations holds CHECKs, triggers (signup
  subscription row, monitor limit) and the state-changing functions. There is no
  RLS: both apps connect directly, so every query on user data must filter by the
  signed-in user's id.
- `docker-compose.yaml` — Postgres and Redis.
- `ecosystem.config.js` — PM2 config running `web` (`next start`) and `worker`
  (`dist/index.js`) in production.

## Working agreements

- **Ask before acting.** Before writing or editing any code, propose the approach
  and get explicit approval first. Don't jump straight to implementation.
- **Standard, best-practice code.** Follow idiomatic conventions for the language/
  framework in use (Next.js App Router conventions, TypeScript, Prisma, Better
  Auth, etc.). No clever or non-standard patterns without a reason.
- **Minimal code.** Write only what the task requires — no speculative features,
  no unused abstractions, no extra config/options "just in case."
- **Modular.** Keep concerns separated (UI vs. data access vs. business logic vs.
  types). Small, focused files/functions over large ones. Reuse `shared` for
  anything both `web` and `worker` need rather than duplicating.
