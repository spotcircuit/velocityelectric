# Cloudflare Email Worker — inbound email capture

Captures emails sent to `*@velocityelectric.co` into Postgres + HubSpot via the
Velocity Electric site, then forwards the email itself to Josh's primary inbox.

## Files

- `email-worker.js` — the Worker source. Uses `postal-mime` to parse MIME, POSTs
  structured payload to `/api/inbound-email`, then forwards original to Josh.

## One-time setup

### 1. Create the Worker via wrangler (recommended)

```bash
# From /home/spotcircuit/velocityelectric/cloudflare:
npm init -y
npm install postal-mime
# Create wrangler.toml (see below), then:
npx wrangler deploy email-worker.js --name velocity-email-capture
```

`wrangler.toml`:

```toml
name = "velocity-email-capture"
main = "email-worker.js"
compatibility_date = "2026-04-01"

[vars]
# INBOUND_SECRET set via Cloudflare dashboard → Worker → Settings → Variables
# (don't commit it here)
```

After deploy, set `INBOUND_SECRET` in:
- Cloudflare → Workers & Pages → velocity-email-capture → Settings → Variables
- Value: must match `INBOUND_SECRET` in Vercel envs (also stored in
  `~/rebar/system/.env` as `INBOUND_SECRET_VELOCITY`)

### 2. Wire to Email Routing

- Cloudflare Dashboard → velocityelectric.co → Email → Routing
- **Routing rules**:
  - Edit `josh@velocityelectric.co` rule:
    - Action: change from "Send to email" → "Send to Worker"
    - Worker: `velocity-email-capture`
  - Edit catch-all rule: same change.
- The Worker itself forwards to `josh@velocitycapitalholding.com` so Josh still
  receives every email — capture is purely additive, nothing is lost.

### 3. Test

Send an email from a personal address to `josh@velocityelectric.co`:

- Should arrive in Josh's `josh@velocitycapitalholding.com` inbox normally
- Should appear at https://www.velocityelectric.co/admin/leads with
  `sourcePage = "email:<message-id>"` and qualification badge
- Should appear in HubSpot if classified as RESIDENTIAL/COMMERCIAL/OUT_OF_SCOPE

## Idempotency

Each email's Message-ID is stored as `Lead.sourcePage = "email:<msg-id>"`. If the
Worker re-fires (Cloudflare retry) the endpoint deduplicates and returns 200 without
creating a duplicate Lead.

## Recovering if the Worker breaks

The forward to capitalholding is a separate try/catch from the POST. If the Vercel
endpoint is down, the email still forwards to Josh — capture is best-effort, delivery
is mandatory.

To temporarily disable capture, change the Email Routing rule back to "Send to
email" → josh@velocitycapitalholding.com. Worker stays deployed but receives no traffic.
