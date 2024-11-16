#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until PGPASSWORD=postgres psql -h "db" -U "postgres" -d "postgres" -c '\q' 2>/dev/null; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing migrations"
PGPASSWORD=postgres psql -h "db" -U "postgres" -d "postgres" -f /app/migrations/init.sql

exec "$@" 