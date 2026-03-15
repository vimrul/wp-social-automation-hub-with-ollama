from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.database import get_db
from app.models.post_publish_log import PostPublishLog
from app.models.user import User
from app.schemas.publishing import PublishPostRequest, PublishPostResponse
from app.services.logs.activity_logger import log_activity
from app.services.publishing.publish_service import publish_post_to_social_account

router = APIRouter(prefix="/publishing", tags=["Publishing"])


@router.post("/publish", response_model=PublishPostResponse)
async def publish_post(
    payload: PublishPostRequest,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles("editor", "admin", "superadmin")),
):
    try:
        result = await publish_post_to_social_account(
            db=db,
            post_id=payload.post_id,
            social_account_id=payload.social_account_id,
            content_text=payload.content_text,
            hashtags=payload.hashtags,
        )

        db.add(
            PostPublishLog(
                post_id=payload.post_id,
                social_account_id=payload.social_account_id,
                platform=result["platform"],
                status="success",
                published_id=result.get("published_id"),
                published_url=result.get("published_url"),
                content_text=result.get("text_used"),
                hashtags=result.get("hashtags_used"),
                error_message=None,
            )
        )
        db.commit()

        log_activity(
            db,
            event_type="post_published",
            entity_type="post",
            entity_id=payload.post_id,
            message=f"Post {payload.post_id} published to {result['platform']}.",
            details={
                "social_account_id": payload.social_account_id,
                "published_id": result.get("published_id"),
                "published_url": result.get("published_url"),
            },
        )

        return {
            "success": True,
            "platform": result["platform"],
            "social_account_id": payload.social_account_id,
            "post_id": payload.post_id,
            "published_id": result.get("published_id"),
            "published_url": result.get("published_url"),
            "message": "Post published successfully",
        }

    except ValueError as e:
        db.add(
            PostPublishLog(
                post_id=payload.post_id,
                social_account_id=payload.social_account_id,
                platform="unknown",
                status="failed",
                published_id=None,
                published_url=None,
                content_text=payload.content_text,
                hashtags=payload.hashtags,
                error_message=str(e),
            )
        )
        db.commit()

        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.add(
            PostPublishLog(
                post_id=payload.post_id,
                social_account_id=payload.social_account_id,
                platform="unknown",
                status="failed",
                published_id=None,
                published_url=None,
                content_text=payload.content_text,
                hashtags=payload.hashtags,
                error_message=str(e),
            )
        )
        db.commit()

        log_activity(
            db,
            event_type="post_publish_failed",
            entity_type="post",
            entity_id=payload.post_id,
            message=f"Failed to publish post {payload.post_id}.",
            details={
                "social_account_id": payload.social_account_id,
                "error": str(e),
            },
        )
        raise HTTPException(status_code=500, detail=str(e))