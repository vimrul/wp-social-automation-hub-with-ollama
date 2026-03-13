#!/bin/bash
set -e

echo "Waiting for database..."
python - <<'PY'
import time
from sqlalchemy import create_engine, text
from app.core.config import settings

for i in range(60):
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database is ready")
        break
    except Exception as e:
        print(f"DB not ready yet: {e}")
        time.sleep(2)
else:
    raise Exception("Database did not become ready in time")
PY

echo "Running migrations..."
python -m alembic upgrade head

echo "Starting FastAPI..."
uvicorn app.main:app --host 0.0.0.0 --port 8000