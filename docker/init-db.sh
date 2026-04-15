#!/bin/bash
# Creates the Convex database alongside the n8n database.
# Runs automatically on first Postgres startup via /docker-entrypoint-initdb.d/
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE convex_self_hosted;
EOSQL
