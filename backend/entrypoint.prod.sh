#!/bin/sh
set -e

cd /app

echo "[backend] waiting for database migrations..."
alembic upgrade head

echo "[backend] seeding baseline data..."
python /app/scripts/seed_prod.py

echo "[backend] starting api server..."
exec gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --timeout 180 \
  --access-logfile - \
  --error-logfile -
