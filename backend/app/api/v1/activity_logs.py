from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.activity_log import ActivityLog

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])


@router.get("")
def list_activity_logs(db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).order_by(ActivityLog.id.desc()).limit(100).all()

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
