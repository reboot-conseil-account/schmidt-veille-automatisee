# Schmidt Veille

Automated competitive intelligence platform. Monitors RSS feeds and keywords across topics, synthesises results with an LLM, and delivers weekly digests by email.

**Stack:** React + Vite · Convex (self-hosted) · n8n · PostgreSQL · Resend

---

## Architecture

```
Browser
  └── Frontend (nginx)         :8080
        └── Convex backend     :3210  ← queries, mutations, actions
              └── PostgreSQL   :5432  ← shared with n8n
        └── n8n                :5678  ← workflow automation
Convex dashboard               :6791  ← admin UI
```

When a workflow is triggered (manually or on schedule), the Convex action calls the n8n webhook, which runs the research pipeline and sends emails via Resend.

---

## Prerequisites

- Docker and Docker Compose v2
- Node.js 22+ and `yarn` (for deploying Convex functions)
- A [Resend](https://resend.com) API key

---

## Deploying with Docker

### 1. Configure environment

```bash
cp .env.example .env
```

Fill in the required secrets:

| Variable | How to generate |
|---|---|
| `POSTGRES_PASSWORD` | `openssl rand -hex 16` |
| `CONVEX_INSTANCE_SECRET` | `openssl rand -hex 32` |
| `N8N_ENCRYPTION_KEY` | `openssl rand -base64 32` |
| `RESEND_API_KEY` | From your Resend dashboard |

> **`N8N_ENCRYPTION_KEY` cannot change after first run** — all stored n8n credentials will break if it does.

### 2. Run first-time setup

```bash
./setup.sh
```

This script will:

1. Start PostgreSQL and the Convex backend
2. Generate a Convex admin key and save it to `.env`
3. Set `N8N_WEBHOOK_URL` in the Convex environment (pointing to n8n internally)
4. Deploy Convex functions to the backend
5. Build and start all services

Once complete:

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| n8n | http://localhost:5678 |
| Convex dashboard | http://localhost:6791 |

### 3. Import the n8n workflow

Open n8n at http://localhost:5678, go to **Workflows → Import**, and import the file from `n8n/workflows/veille-automatisee.json`.

### 4. Subsequent starts

```bash
docker compose up -d
```

To redeploy Convex functions after code changes:

```bash
source .env
CONVEX_SELF_HOSTED_URL=$CONVEX_CLOUD_ORIGIN \
CONVEX_SELF_HOSTED_ADMIN_KEY=$CONVEX_SELF_HOSTED_ADMIN_KEY \
  npx convex deploy --yes
```

---

## Deploying on a VPS

Same as above, with two additions: a domain and HTTPS.

### 1. Point DNS records to your VPS

Create an `A` record for each subdomain → your VPS IP:

```
app.yourdomain.com
convex.yourdomain.com
convex-site.yourdomain.com
n8n.yourdomain.com
dashboard.yourdomain.com
```

### 2. Configure `.env` for production

In addition to the base secrets, set:

```bash
# Public URLs (as seen from the browser)
CONVEX_CLOUD_ORIGIN=https://convex.yourdomain.com
CONVEX_SITE_ORIGIN=https://convex-site.yourdomain.com

# Domains for Caddy (must match your DNS records above)
APP_DOMAIN=app.yourdomain.com
CONVEX_DOMAIN=convex.yourdomain.com
CONVEX_SITE_DOMAIN=convex-site.yourdomain.com
N8N_DOMAIN=n8n.yourdomain.com
DASHBOARD_DOMAIN=dashboard.yourdomain.com
```

### 3. Run setup and start Caddy

```bash
./setup.sh

# Start Caddy — handles HTTPS and certificate renewal automatically
docker compose --profile production up caddy -d
```

Caddy will obtain Let's Encrypt certificates on first start. Make sure ports 80 and 443 are open in your firewall.

---

## Deploying on Railway

Railway can deploy each service from its Docker image directly — no templates required.

### 1. Create services

In Railway, create a new project and add one service per component:

| Service name | Source |
|---|---|
| `postgres` | Railway managed Postgres database |
| `convex-backend` | Docker image: `ghcr.io/get-convex/convex-backend:latest` |
| `convex-dashboard` | Docker image: `ghcr.io/get-convex/convex-dashboard:latest` |
| `n8n` | Docker image: `docker.n8n.io/n8nio/n8n:latest` |
| `frontend` | GitHub repo (Railway auto-detects the `Dockerfile`) |

Alternatively, drag your `docker-compose.yml` onto the Railway project canvas — Railway will create all services automatically.

### 2. Generate public domains

In Railway, generate a public domain for these services and note the URLs:

- `convex-backend` (expose port `3210`) → e.g. `convex-backend.railway.app`
- `frontend` (expose port `80`)
- `n8n` (expose port `5678`)
- `convex-dashboard` (expose port `6791`)

### 3. Set environment variables

Railway services communicate via private hostnames (`<name>.railway.internal`). Set these variables in each service:

**convex-backend:**
```
CONVEX_CLOUD_ORIGIN=https://convex-backend.railway.app
CONVEX_SITE_ORIGIN=https://convex-backend.railway.app
POSTGRES_URL=<from Railway Postgres service>
DO_NOT_REQUIRE_SSL=1
INSTANCE_SECRET=<openssl rand -hex 32>
```

**convex-dashboard:**
```
NEXT_PUBLIC_DEPLOYMENT_URL=https://convex-backend.railway.app
```

**n8n:**
```
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres.railway.internal
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=<postgres user>
DB_POSTGRESDB_PASSWORD=<postgres password>
N8N_ENCRYPTION_KEY=<openssl rand -base64 32>
CONVEX_URL=http://convex-backend.railway.internal:3210
CONVEX_API_KEY=<admin key — generated in step 4>
RESEND_API_KEY=<your key>
WEBHOOK_URL=https://n8n.railway.app/
```

**frontend** (set as a build variable, not a runtime variable):
```
VITE_CONVEX_URL=https://convex-backend.railway.app
```

### 4. Generate the Convex admin key

Once `convex-backend` is running, use the Railway CLI:

```bash
railway link          # link to your project
railway run --service convex-backend ./generate_admin_key.sh
```

Copy the key and set it as `CONVEX_SELF_HOSTED_ADMIN_KEY` on the `convex-backend`, `n8n`, and `convex-dashboard` services, then redeploy them.

### 5. Deploy Convex functions

Run this from your local machine:

```bash
CONVEX_SELF_HOSTED_URL=https://convex-backend.railway.app \
CONVEX_SELF_HOSTED_ADMIN_KEY=<your admin key> \
  npx convex deploy --yes
```

### 6. Set the n8n webhook URL in Convex

The Convex action calls n8n server-side, so use the internal Railway hostname:

```bash
CONVEX_SELF_HOSTED_URL=https://convex-backend.railway.app \
CONVEX_SELF_HOSTED_ADMIN_KEY=<your admin key> \
  npx convex env set N8N_WEBHOOK_URL http://n8n.railway.internal:5678/webhook/trigger-veille
```

### 7. Import the n8n workflow

Open the n8n public URL, go to **Workflows → Import**, and import `n8n/workflows/veille-automatisee.json`.

---

## Development

```bash
# Start Convex backend (cloud-hosted, free tier)
yarn convex

# Start the frontend dev server
yarn dev
```

---

## Project structure

```
convex/          Convex backend functions (queries, mutations, actions)
src/             React frontend
  pages/         Route-level components
  components/    Shared UI components
n8n/workflows/   Exported n8n workflow (import via n8n UI)
docker/          Docker support files (nginx.conf, Caddyfile, init-db.sh)
Dockerfile       Multi-stage frontend build
docker-compose.yml
setup.sh         First-time setup automation
```
