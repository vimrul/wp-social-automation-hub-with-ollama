from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.activity_log import ActivityLog
from app.models.ollama_profile import OllamaProfile
from app.models.post import Post
from app.models.prompt_template import PromptTemplate
from app.models.social_account import SocialAccount
from app.models.source_fetch_config import SourceFetchConfig
from app.models.source_site import SourceSite
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    total_sites = db.query(SourceSite).count()
    total_fetch_configs = db.query(SourceFetchConfig).count()
    total_posts = db.query(Post).count()
    total_prompt_templates = db.query(PromptTemplate).count()
    total_ollama_profiles = db.query(OllamaProfile).count()
    total_social_accounts = db.query(SocialAccount).count()
    recent_activity = (
        db.query(ActivityLog)
        .order_by(ActivityLog.id.desc())
        .limit(10)
        .all()
    )

    return {
        "total_sites": total_sites,
        "total_fetch_configs": total_fetch_configs,
        "total_posts": total_posts,
        "total_prompt_templates": total_prompt_templates,
        "total_ollama_profiles": total_ollama_profiles,
        "total_social_accounts": total_social_accounts,
        "recent_activity": [
            {
                "id": row.id,
                "event_type": row.event_type,
                "entity_type": row.entity_type,
                "entity_id": row.entity_id,
                "message": row.message,
                "details": getattr(row, "details", None) or getattr(row, "details_json", None),
                "created_at": row.created_at,
            }
            for row in recent_activity
        ],
    }