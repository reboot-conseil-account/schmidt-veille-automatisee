#!/usr/bin/env bash
# First-time setup script for schmidt-veille.
# Run once after copying .env.example to .env and filling in the secrets.
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}▶${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $*"; }
error() { echo -e "${RED}✗${NC} $*"; exit 1; }

# ── Preflight ─────────────────────────────────────────────────────────────────
[[ -f .env ]] || error ".env not found — copy .env.example to .env and fill in the values first."
source .env

[[ -n "${POSTGRES_PASSWORD:-}" ]]      || error "POSTGRES_PASSWORD is not set in .env"
[[ -n "${CONVEX_INSTANCE_SECRET:-}" ]] || error "CONVEX_INSTANCE_SECRET is not set in .env (generate with: openssl rand -hex 32)"
[[ -n "${N8N_ENCRYPTION_KEY:-}" ]]     || error "N8N_ENCRYPTION_KEY is not set in .env"
[[ -n "${RESEND_API_KEY:-}" ]]         || error "RESEND_API_KEY is not set in .env"

# ── Step 1: Start Postgres + Convex backend ───────────────────────────────────
info "Starting Postgres and Convex backend..."
docker compose up postgres convex-backend -d --wait

# ── Step 2: Generate admin key ────────────────────────────────────────────────
info "Generating Convex admin key..."
ADMIN_KEY=$(docker compose exec convex-backend ./generate_admin_key.sh | tail -1 | tr -d '\r')
[[ -n "$ADMIN_KEY" ]] || error "Failed to generate admin key."

# Write it to .env (awk handles special characters in the key like `|`)
if grep -q "^CONVEX_SELF_HOSTED_ADMIN_KEY=" .env; then
  awk -v key="$ADMIN_KEY" \
    '/^CONVEX_SELF_HOSTED_ADMIN_KEY=/{print "CONVEX_SELF_HOSTED_ADMIN_KEY=" key; next} {print}' \
    .env > .env.tmp && mv .env.tmp .env
else
  echo "CONVEX_SELF_HOSTED_ADMIN_KEY=${ADMIN_KEY}" >> .env
fi
info "Admin key saved to .env"

# ── Step 3: Set N8N_WEBHOOK_URL in Convex environment ────────────────────────
# The Convex action fetches n8n from inside Docker, so we use the service name.
info "Setting N8N_WEBHOOK_URL in Convex environment..."
CONVEX_SELF_HOSTED_URL="${CONVEX_CLOUD_ORIGIN:-http://localhost:3210}" \
CONVEX_SELF_HOSTED_ADMIN_KEY="$ADMIN_KEY" \
  npx convex env set N8N_WEBHOOK_URL http://n8n:5678/webhook/trigger-veille

# ── Step 4: Deploy Convex functions ──────────────────────────────────────────
info "Deploying Convex functions..."
CONVEX_SELF_HOSTED_URL="${CONVEX_CLOUD_ORIGIN:-http://localhost:3210}" \
CONVEX_SELF_HOSTED_ADMIN_KEY="$ADMIN_KEY" \
  npx convex deploy --yes

# ── Step 5: Start everything ──────────────────────────────────────────────────
info "Starting all services..."
docker compose up -d --build

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "  Frontend  → http://localhost:${FRONTEND_PORT:-8080}"
echo "  n8n       → http://localhost:5678"
echo "  Dashboard → http://localhost:${DASHBOARD_PORT:-6791}"
echo ""
warn "Import your n8n workflow from n8n/workflows/ via the n8n UI."
