from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.publishing import PublishPostRequest, PublishPostResponse
from app.services.logs.activity_logger import log_activity
from app.services.publishing.publish_service import publish_post_to_social_account

router = APIRouter(prefix="/publishing", tags=["Publishing"])


@router.post("/publish", response_model=PublishPostResponse)
async def publish_post(payload: PublishPostRequest, db: Session = Depends(get_db)):
    try:
        result = await publish_post_to_social_account(
            db=db,
            post_id=payload.post_id,
            social_account_id=payload.social_account_id,
            content_text=payload.content_text,
            hashtags=payload.hashtags,
        )

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
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
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