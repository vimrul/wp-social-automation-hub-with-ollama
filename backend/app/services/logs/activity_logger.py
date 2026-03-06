import json
from typing import Optional

from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog


def log_activity(
    db: Session,
    *,
    event_type: str,
    entity_type: str,
    message: str,
    entity_id: Optional[int] = None,
    severity: str = "info",
    details: Optional[dict] = None,
) -> ActivityLog:
    row = ActivityLog(
        event_type=event_type,
        entity_type=entity_type,
        entity_id=entity_id,
        severity=severity,
        message=message,
        details_json=json.dumps(details) if details else None,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
