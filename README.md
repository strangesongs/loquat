# fruit for all

**fruit for all** is an open source, community-built map of street fruit you can actually pick — trees, bushes, and vines on public land where anyone can forage. Find it, pick it, share it.

Live at **[fruitforall.app](https://fruitforall.app)** &nbsp;·&nbsp; questions? **[admin@fruitforall.app](mailto:admin@fruitforall.app)**

---

## what it does

- Browse a live map of user-submitted fruit trees
- Sign up and add fruit near your current location
- Filter by fruit type
- Anyone (no account required) can browse the map

## stack

| Layer | Tech |
|---|---|
| Frontend | React (class components), React-Leaflet, esbuild |
| Backend | Node.js, Express 4 |
| Database | AWS DynamoDB |
| Auth | JWT 7-day, bcrypt |
| Email | Resend |
| Hosting | Railway |

## documentation

| Doc | What it’s for |
|-----|----------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the app and API fit together, DynamoDB model, PWA |
| [docs/SECURITY.md](docs/SECURITY.md) | Reporting vulnerabilities, threat surface, operations |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to develop, test, and open PRs |
| [docs/README.md](docs/README.md) | Index of all of the above |

## local setup

### prerequisites

- Node.js 18+
- AWS account with DynamoDB access
- (Optional) Resend API key for email features

### 1. clone and install

```sh
git clone https://github.com/strangesongs/fruit-for-all.git
cd fruit-for-all
npm install
```

### 2. environment

```sh
cp .env.example .env
```

Edit `.env`:

```
NODE_ENV=development
JWT_SECRET=        # generate: openssl rand -base64 32
AWS_REGION=us-west-2
DYNAMODB_USERS_TABLE=LoquatUsers   # legacy: DYNAMODB_TABLE is still accepted as a fallback
PINS_TABLE=LoquatPins
REDIS_URL=         # optional — same rate limits across all Node processes
RESEND_API_KEY=    # optional — emails skipped if absent
APP_URL=http://localhost:3000
ADMIN_EMAIL=       # optional
```

### 3. AWS credentials

```sh
aws configure
```

Or set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `.env`.  
The IAM user needs DynamoDB read/write access on both tables.

### 4. DynamoDB tables

Create two tables in the AWS console:

| Table | Partition key |
|---|---|
| `LoquatUsers` | `userName` (String) — partition only |
| `LoquatPins` | `pinId` (String) partition, `createdAt` (String) sort key — GSIs: `status-index` (`status`), `submittedBy-index` (`submittedBy`) as needed by [schemas.js](server/schemas/schemas.js) |

`GET /health` returns `{ "status": "ok", "time": "…" }` for load balancers and uptime checks.

### 5. run

```sh
npm run dev        # client (port 3000) + server (port 8080)
npm run build      # production build to dist/
```

## production ops (multi-instance, tiles, cost)

- **Rate limits** — In-memory by default. Set `REDIS_URL` (e.g. Upstash or Redis on Railway) so all replicas share the same per-IP counters for auth, create-pin, and public `GET /api/pins/public`.
- **Stadia + OSM tiles** — The app uses Stadia-served tiles; traffic scales with **map drags and zooms**, not with your API. Monitor Stadia (or your tile provider) quotas and plan for a fallback or self-hosted tiles if usage grows.
- **DynamoDB** — `getAllPins` uses **Query** on the status GSI, not a full table scan. `getPinById` uses **Query** on the `pinId` partition.

## project structure

```
server.js
server/
  controllers/        # index.js, auth.js, pinsController.js
  schemas/            # users.js, pins.js, zone.js, validation.js, errors.js, schemas.js (re-exports)
  db/dynamo.js
  utils/html.js, utils/profanity.js
client/
  index.js            # esbuild entry
  map.jsx, sidebar.jsx, …
  utils/
  stylesheets/
```

Dependency updates: see [`.github/dependabot.yml`](.github/dependabot.yml). `npm audit` is run in CI (high severity; **warn** only - see [workflow](.github/workflows/ci.yml)).

## contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## license

GPL-3.0 — see [LICENSE](LICENSE). Forks must remain open source.
