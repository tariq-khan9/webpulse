# WebPulse — Uptime Monitoring Plan (v1)

Users register websites and APIs. A worker checks each one every 5 minutes, records
up/down changes as incidents, emails on down and recovery, and charts uptime.

## Constraints that drive every decision

- **Self-hosted Postgres on the same VPS.** Postgres stores durable facts only. Nothing
  high-frequency goes into it.
- **Postgres and Redis in Docker, Prisma, Better Auth.** Both run as containers beside
  the apps. Every database query goes through Prisma, and sign-in is Better Auth
  (email/password with verification, Google, password reset). There is no hosted
  database service and no RLS, so every query on user data filters by user id.
- **8 GB VPS, shared.** It also runs karkhanoprime.com, the main app, so WebPulse
  keeps a modest footprint: web + worker + its own Postgres and Redis.
- **Keep v1 simple.** No multi-region, no status pages, no extra alert channels.
- The schema and dashboard are **not final** — this plan changes both where it helps.

## How we build this

- Code stays **standard and professional**: idiomatic Next.js App Router, TypeScript,
  and BullMQ. No clever tricks, no speculative abstractions, no unused options.
- This is your first uptime system and your first real use of Redis, so **each module
  starts with a short explanation** — what it does, why it is built that way, and the
  concept behind it (queues, job schedulers, capped lists, cache-aside) — before any
  code gets written.
- One module at a time, reviewed before moving to the next.

---

## The core idea: Redis holds "now", Postgres holds "history"

This one split is what keeps the free tier safe.

| Data | Lives in | Why |
|---|---|---|
| Current status, last checked, last response time | **Redis** | Changes every 5 min, per monitor |
| Last ~48 h of response times | **Redis** (capped list, auto-expiring) | High frequency and disposable |
| Monitor config (url, method, interval) | Postgres | Small, must survive anything |
| Incidents (went down / came back) | Postgres | Rare, and the real value of the product |
| One uptime + avg-response row per monitor per day | Postgres | ~36k rows/year at 100 monitors |

A normal 5-minute check where nothing changed writes **only to Redis** — Postgres is
touched when a monitor actually changes state, and once a night for the rollup. That
is roughly a 99% cut in database writes.

Postgres stays the authority and Redis is a cache in front of it: if Redis is lost,
status and incident history are still correct, and only the live chart has a gap.

## Schema changes (all landed in the baseline migration)

- `monitors` — add `method`, `timeout_ms`, `check_interval_seconds` (300 now, so the
  Pro 1-minute tier is later a value change, not a migration).
- `incidents` — add `status_code` and `error_message`, so the UI can say *why*.
- `uptime_daily` — add `avg_response_ms`, one integer on a row we already write,
  averaged from the Redis samples before they expire.
- Two real gaps to fix in the same migration: nothing creates a `subscriptions` row
  at signup, so `monitor_limit` is undefined for new users; and nothing enforces that
  limit, so a user can insert unlimited monitors straight past the paywall.

---

## Modules

### 1. Shared contracts (`shared/`)
**Goal:** web and worker agree on queue names, job payload, and Redis key formats.
**How:** add a queue module (connection + schedule helpers) and a metrics module
(Redis read/write) to the existing `shared` package, so neither app invents its own
key format, plus one Prisma client factory so neither app builds its own.

### 2. Worker foundation (`apps/worker/src/`)
**Goal:** a worker process that boots, validates its config, and shuts down cleanly.
**How:** small files for config (fail loudly on missing env), the Prisma client,
logging, and an entry point that wires them together. The worker app
has no `src/` at all yet, so this is the skeleton everything else plugs into.

### 3. Queue and schedulers
**Goal:** every active monitor gets checked every 5 minutes, reliably.
**How:** each monitor owns one BullMQ job scheduler keyed by its id. A reconciler
runs at boot and hourly, comparing the schedulers in Redis against the monitors
table and fixing any difference. That reconciler is what lets the system survive a
crash, a flushed Redis, or a row you edited by hand in the database.

### 4. Check executor
**Goal:** turn one URL into a verdict we can trust.
**How:** fetch with a timeout, treat 2xx/3xx as up, and **never read the response
body** — a monitored 50 MB file must not land in worker memory. Retry up to 3 times
inside the job before declaring "down", so one blip cannot fabricate an incident. A
URL guard rejects localhost and private IPs, or users could probe our own server.

### 5. State and incident tracking
**Goal:** record what changed, and touch Postgres only when something did.
**How:** compare the new verdict against the status cached in Redis. Unchanged →
update Redis and stop. Changed → call a single Postgres function that opens or
resolves the incident and updates the monitor in one transaction, then reports back
what happened. Redis only decides *when to ask*; Postgres decides what is true.

### 6. Alerts
**Goal:** one email when a monitor goes down, one when it recovers, never duplicates.
**How:** send through Resend, already used elsewhere in the project. The `alerts`
table's existing unique constraint on (incident, type) does the deduplication —
insert the row first, then send. A duplicate insert simply fails, which is exactly
the protection we want, and it holds even if a job is retried after a crash.

### 7. Response-time history (Redis)
**Goal:** a real 24-hour response-time chart with zero Postgres growth.
**How:** after each successful check, push `timestamp:ms` onto a capped list and
refresh a TTL on the key. The cap bounds memory; the TTL means deleted and paused
monitors clean themselves up with no cleanup job. Only successful checks are
recorded — a timeout is not a response time, and downtime should read as a gap.

### 8. Web: monitors and dashboard
**Goal:** add, edit, pause, and delete monitors; see status, incidents, and charts.
**How:** server actions for CRUD, each one also updating that monitor's schedule in
Redis so the two never drift. Every read is scoped to the signed-in user's id, since
nothing in the database enforces that for us. The dashboard merges two sources — live
status from Redis, history from Postgres.

### 9. Daily rollup
**Goal:** keep long-range charts without keeping long-range data.
**How:** once a night, compute yesterday's uptime from the incident timestamps and
yesterday's average response from the Redis samples, then write one row per monitor.
The samples are then free to expire. This is why the Redis window holds ~48 hours
rather than 24: at midnight, a 24-hour window has already dropped part of yesterday.

---

## Build order

Each step leaves something you can run and see.

1. Migration + shared contracts
2. Worker foundation + queue + executor + state tracking → monitors get checked
3. Web CRUD → add monitors from the UI instead of hand-written SQL
4. Dashboard + response-time chart → by now Redis has a real day of data to draw
5. Alerts → real emails, once there is incident data to describe
6. Daily rollup → long-range charts
7. Ops: Redis memory limits, PM2 settings, reboot and Redis-flush test

## Things that are easy to get wrong

- Redis must run `noeviction` (BullMQ requires it), which means at max memory a write
  *errors*. Chart writes must be wrapped and non-fatal — never fail a check over a
  cosmetic chart write.
- Redis keys carry no ownership of their own. Always confirm through Postgres that a
  monitor belongs to the signed-in user before reading that monitor's Redis keys.
- A false "down" permanently corrupts uptime, because uptime is derived from
  incidents rather than sampled. That is why the executor retries before declaring.
- Pausing must resolve any open incident, or a monitor paused mid-outage accrues
  downtime forever.
