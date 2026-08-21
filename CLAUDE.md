# WebPulse

Uptime-monitoring SaaS (pnpm monorepo). Users register URLs to monitor; a background
worker checks them periodically and records status/incidents/uptime history; alerts
fire on state changes; access is gated by a Stripe-backed subscription tier.

## Structure

- `apps/web` — Next.js 16 / React 19 frontend. Supabase auth (signup/login, email
  verification), landing page, early `(dashboard)` route. Tailwind 4, react-hook-form
  + zod.
- `apps/worker` — BullMQ (Redis) background worker that will perform the actual
  uptime checks using the Supabase service-role client. Scaffolded only, no `src/`
  yet.
- `shared` (`@webpulse/shared`) — shared types (`CheckJobPayload`, `MonitorStatus`,
  generated Supabase DB types) consumed by both `web` and `worker`.
- `supabase/migrations` — schema: `monitors`, `incidents`, `uptime_daily`,
  `subscriptions`, `alerts`. RLS scopes all client reads to `auth.uid()`; writes to
  incidents/uptime/alerts/subscriptions are reserved for the worker/webhooks via the
  service-role key (no client-side insert/update policies for those tables).
- `docker-compose.yaml` — Redis for BullMQ.
- `ecosystem.config.js` — PM2 config running `web` (`next start`) and `worker`
  (`dist/index.js`) in production.

## Working agreements

- **Ask before acting.** Before writing or editing any code, propose the approach
  and get explicit approval first. Don't jump straight to implementation.
- **Standard, best-practice code.** Follow idiomatic conventions for the language/
  framework in use (Next.js App Router conventions, TypeScript, RLS-aware Supabase
  access patterns, etc.). No clever or non-standard patterns without a reason.
- **Minimal code.** Write only what the task requires — no speculative features,
  no unused abstractions, no extra config/options "just in case."
- **Modular.** Keep concerns separated (UI vs. data access vs. business logic vs.
  types). Small, focused files/functions over large ones. Reuse `shared` for
  anything both `web` and `worker` need rather than duplicating.
