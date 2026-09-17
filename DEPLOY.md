# Deploying WebPulse

One VPS runs everything: Nginx → Next.js (`web`), the BullMQ `worker`, and
Postgres + Redis in Docker. Stripe, Resend and Google sign-in are hosted services.

## 1. Hosted services

**Google (sign-in)**
- Google Cloud console → APIs & Services → Credentials → OAuth client (Web).
- Authorized redirect URI: `https://<domain>/api/auth/callback/google`
  → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

**Resend**
- Verify your sending domain (SPF + DKIM DNS records), then use an address on it
  for `EMAIL_FROM` (web: verification and password reset) and `ALERT_FROM_EMAIL`
  (worker: down/recovery alerts).

**Stripe** (do this in test mode first, then repeat in live mode)
- Create a product "WebPulse Pro" with a monthly $9 price → `STRIPE_PRO_PRICE_ID`.
- Developers → Webhooks: endpoint `https://<domain>/api/stripe/webhook`, events
  `customer.subscription.created`, `customer.subscription.updated`,
  `customer.subscription.deleted` → signing secret is `STRIPE_WEBHOOK_SECRET`.
- Settings → Billing → Customer portal: enable it, allow cancel **at end of
  billing period** and payment-method updates (the Terms page promises both).
- Settings → Billing → Subscriptions and emails: turn on failed-payment retries.

**Before launch:** replace `LEGAL_CONTACT_EMAIL` in
`apps/web/src/lib/legal.ts` and have the Privacy/Terms pages reviewed.

## 2. Server setup (once)

```bash
# Node 22+, pnpm, PM2, Docker, Nginx, Certbot
corepack enable
npm install -g pm2
pm2 install pm2-logrotate          # keeps PM2 logs from filling the disk

git clone <repo> webpulse && cd webpulse
```

`.env` files are git-ignored, so create one in each of these places by hand,
with production values:

- `.env` (root) — `POSTGRES_PASSWORD`, `POSTGRES_PORT=5432`, `REDIS_PORT=6379`.
- `shared/.env` — `DATABASE_URL` (used by Prisma migrations).
- `apps/web/.env` — `NEXT_PUBLIC_SITE_URL=https://<domain>`, `DATABASE_URL`,
  `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), Google, Resend and Stripe keys.
- `apps/worker/.env` — `DATABASE_URL`, `REDIS_URL=redis://localhost:6379`,
  Resend keys, `LOG_LEVEL=info`.

`DATABASE_URL` is `postgresql://webpulse:<POSTGRES_PASSWORD>@localhost:5432/webpulse`.

Then start the databases: `docker compose up -d` (Postgres + Redis, bound to
localhost only).

Run `sudo sysctl vm.overcommit_memory=1` (and persist it in `/etc/sysctl.conf`);
Redis warns without it and background saves can fail under memory pressure.

**Backups:** the database now lives on this server. Schedule a nightly
`docker compose exec -T postgres pg_dump -U webpulse webpulse | gzip` to storage
off the VPS.

## 3. Build and start

```bash
pnpm install --frozen-lockfile
pnpm db:deploy                     # apply Prisma migrations
pnpm build
pm2 start ecosystem.config.js
pm2 save
pm2 startup                        # run the command it prints, so PM2 survives reboots
```

## 4. Nginx + HTTPS

```nginx
server {
    server_name <domain>;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then `sudo certbot --nginx -d <domain>`. Only ports 22, 80 and 443 should be
open in the firewall.

## 5. Deploying an update

```bash
git pull
pnpm install --frozen-lockfile
pnpm db:deploy                     # no-op when there are no new migrations
pnpm build
pm2 reload ecosystem.config.js
```

## 6. Launch checks

- [ ] Sign up with email → confirmation email arrives → link signs you in.
- [ ] Sign in with Google → dashboard loads.
- [ ] Forgot password → reset email arrives → new password works.
- [ ] Add a monitor for a URL you control → shows "Up" within 5 minutes.
- [ ] Stop that site → "down" email arrives; start it → "back up" email arrives.
- [ ] Upgrade with Stripe test card `4242 4242 4242 4242` → plan shows Pro,
      monitor list shows "every 1 min".
- [ ] Cancel in the portal and let the period end (or cancel immediately in the
      Stripe dashboard) → plan returns to Free, monitors beyond 3 are paused.
- [ ] `sudo reboot` → after boot, `pm2 ls` shows both apps online and checks resume.
- [ ] `pm2 logs worker` shows `Reconciled schedulers` once an hour and no errors.
