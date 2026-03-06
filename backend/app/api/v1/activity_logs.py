from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.activity_log import ActivityLog

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])


@router.get("")
def list_activity_logs(
    db: Session = Depends(get_db),
    event_type: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    query = db.query(ActivityLog)

    if event_type:
        query = query.filter(ActivityLog.event_type == event_type)

    if entity_type:
        query = query.filter(ActivityLog.entity_type == entity_type)

    if severity:
        query = query.filter(ActivityLog.severity == severity)

    logs = (
        query.order_by(ActivityLog.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": log.id,
            "event_type": log.event_type,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "severity": log.severity,
            "message": log.message,
            "details_json": log.details_json,
            "created_at": log.created_at,
        }
        for log in logs
    ]
