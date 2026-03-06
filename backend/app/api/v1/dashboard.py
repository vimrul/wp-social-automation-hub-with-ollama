from datetime import date, datetime, time

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.activity_log import ActivityLog
from app.models.ai_generation import AIGeneration
from app.models.post import Post
from app.models.source_site import SourceSite

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    today_start = datetime.combine(date.today(), time.min)

    total_sites = db.query(SourceSite).count()
    total_posts = db.query(Post).count()
    total_ai_generations = db.query(AIGeneration).count()
    total_activity_logs = db.query(ActivityLog).count()

    posts_fetched_today = db.query(Post).filter(Post.created_at >= today_start).count()
    ai_generated_today = db.query(AIGeneration).filter(AIGeneration.generated_at >= today_start).count()
    activity_today = db.query(ActivityLog).filter(ActivityLog.created_at >= today_start).count()

    latest_posts = (
        db.query(Post)
        .order_by(Post.id.desc())
        .limit(5)
        .all()
    )

    return {
        "counts": {
            "total_sites": total_sites,
            "total_posts": total_posts,
            "total_ai_generations": total_ai_generations,
            "total_activity_logs": total_activity_logs,
            "posts_fetched_today": posts_fetched_today,
            "ai_generated_today": ai_generated_today,
            "activity_today": activity_today,
        },
        "latest_posts": [
            {
                "id": post.id,
                "title": post.title,
                "slug": post.slug,
                "status": post.status,
                "source_site_id": post.source_site_id,
                "created_at": post.created_at,
            }
            for post in latest_posts
        ],
    }
