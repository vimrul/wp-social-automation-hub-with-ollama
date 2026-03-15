#!/bin/sh
set -e

export PYTHONPATH=/app

echo "Waiting for postgres..."
until nc -z postgres 5432; do
  sleep 2
done

echo "Running migrations..."
alembic upgrade head

echo "Running seed..."
python /app/scripts/seed_prod.py || true

echo "Starting backend..."
uvicorn app.main:app --host 0.0.0.0 --port 8000
