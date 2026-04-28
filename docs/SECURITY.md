# Security

## Reporting a vulnerability

Please email **admin@fruitforall.app** with a clear description, steps to reproduce, and impact. We will triage in good faith; this is a small open-source project without a formal bug-bounty program.

**Please do not** file public issues for active exploitation until we have a chance to patch.

If pin list endpoints cannot reach DynamoDB, the API responds with **503** and a short message (see `PinsQueryError` in `server/schemas`) rather than an empty map.

## Design summary

- **Transport:** Deploy behind HTTPS in production (e.g. Railway with TLS). The app assumes same-origin API calls in production (`API_BASE` is `''` when `NODE_ENV=production` in the client build).
- **CORS:** In production, the server only sets `Access-Control-Allow-Origin` for origins listed in `ALLOWED_ORIGINS`. Configure this to your real site origin(s).
- **CSP:** Helmet sets a strict Content-Security-Policy. Map tiles and fonts require specific allowlist entries; see [`server.js`](../server.js).
- **Auth:** Passwords are hashed with bcrypt. Sessions use **stateless JWTs** (default expiry 7 days). A strong, unique **`JWT_SECRET`** is required in production; the app exits on startup if it is missing.
- **Rate limits:** `express-rate-limit` protects auth, pin write, and public read endpoints. For **multiple app replicas**, set **`REDIS_URL`** so limits are distributed (see [README](../README.md)).
- **Usernames on map:** Public and guest-facing responses omit `submittedBy` on pins.

## Operational hygiene

- Do not commit `.env` (see `.gitignore`). Rotate `JWT_SECRET` and any leaked AWS keys if exposed.
- Restrict **IAM** for DynamoDB to the tables and actions this app needs.
- If you add **new client-side fetches** to third-party hosts, you must allow them in `connectSrc` (and any other relevant CSP directive) in `server.js`.

## What this document is not

This is not a formal audit, penetration test, or compliance certification. For large deployments, consider a professional review and a structured dependency-update process (`npm audit`, CI, Dependabot, etc.).
