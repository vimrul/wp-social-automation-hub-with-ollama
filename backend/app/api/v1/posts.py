from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.ai_generation import AIGeneration
from app.models.post import Post
from app.models.source_fetch_config import SourceFetchConfig
from app.schemas.ai_generation import AIGenerationRead
from app.schemas.post import ImportPostsResponse, PostListRead, PostRead
from app.services.logs.activity_logger import log_activity
from app.services.source.import_service import import_posts_from_config
from app.models.post_publish_log import PostPublishLog
from app.schemas.post_publish_log import PostPublishLogRead

router = APIRouter(prefix="/posts", tags=["Posts"])


class ImportPostsRequest(BaseModel):
    per_page: Optional[int] = None
    page: Optional[int] = None


def build_latest_ai_map(generations: list[AIGeneration]) -> dict:
    latest = {
        "twitter_summary": None,
        "facebook_summary": None,
        "hashtags": None,
    }

    for row in generations:
        if row.generation_type in latest and latest[row.generation_type] is None:
            latest[row.generation_type] = {
                "generation_id": row.id,
                "output_text": row.output_text,
                "generated_at": row.generated_at,
                "prompt_template_id": row.prompt_template_id,
                "ollama_profile_id": row.ollama_profile_id,
                "hashtags": getattr(row, "hashtags", None),
            }

    return latest
@router.get("/{post_id}/publish-logs", response_model=list[PostPublishLogRead])
def list_post_publish_logs(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return (
        db.query(PostPublishLog)
        .filter(PostPublishLog.post_id == post_id)
        .order_by(PostPublishLog.id.desc())
        .all()
    )

@router.get("", response_model=list[PostListRead])
def list_posts(
    db: Session = Depends(get_db),
    source_site_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    query = db.query(Post)

    if source_site_id is not None:
        query = query.filter(Post.source_site_id == source_site_id)

    if status:
        query = query.filter(Post.status == status)

    if search:
        like_term = f"%{search}%"
        query = query.filter(
            (Post.title.ilike(like_term))
            | (Post.slug.ilike(like_term))
            | (Post.excerpt.ilike(like_term))
        )

    return query.order_by(Post.id.desc()).offset(offset).limit(limit).all()


@router.get("/{post_id}", response_model=PostRead)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("/{post_id}/detail")
def get_post_detail(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    generations = (
        db.query(AIGeneration)
        .filter(AIGeneration.post_id == post_id)
        .order_by(AIGeneration.id.desc())
        .all()
    )

    latest = build_latest_ai_map(generations)

    return {
        "post": {
            "id": post.id,
            "source_site_id": post.source_site_id,
            "fetch_config_id": post.fetch_config_id,
            "external_post_id": post.external_post_id,
            "external_post_url": post.external_post_url,
            "slug": post.slug,
            "title": post.title,
            "excerpt": post.excerpt,
            "raw_content": post.raw_content,
            "clean_content": post.clean_content,
            "featured_image_url": post.featured_image_url,
            "categories_json": post.categories_json,
            "tags_json": post.tags_json,
            "status": post.status,
            "source_publish_status": post.source_publish_status,
            "original_published_at": post.original_published_at,
            "source_modified_at": post.source_modified_at,
            "first_fetched_at": post.first_fetched_at,
            "last_fetched_at": post.last_fetched_at,
            "content_hash": post.content_hash,
            "is_deleted_in_source": post.is_deleted_in_source,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
        },
        "latest_ai": latest,
    }


@router.get("/{post_id}/ai-generations", response_model=list[AIGenerationRead])
def list_post_ai_generations(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return (
        db.query(AIGeneration)
        .filter(AIGeneration.post_id == post_id)
        .order_by(AIGeneration.id.desc())
        .all()
    )


@router.get("/{post_id}/ai-latest")
def get_post_ai_latest(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    generations = (
        db.query(AIGeneration)
        .filter(AIGeneration.post_id == post_id)
        .order_by(AIGeneration.id.desc())
        .all()
    )

    latest = build_latest_ai_map(generations)

    return {
        "post_id": post_id,
        "latest": latest,
    }


@router.post("/import/{config_id}", response_model=ImportPostsResponse)
async def import_posts(
    config_id: int,
    payload: Optional[ImportPostsRequest] = Body(default=None),
    db: Session = Depends(get_db),
):
    config = db.query(SourceFetchConfig).filter(SourceFetchConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Fetch config not found")

    try:
        runtime_query_params = {}

        if payload is not None:
            if payload.per_page is not None:
                runtime_query_params["per_page"] = payload.per_page

            if payload.page is not None:
                runtime_query_params["page"] = payload.page

        result = await import_posts_from_config(
            db=db,
            config=config,
            runtime_query_params=runtime_query_params,
        )

        log_activity(
            db,
            event_type="posts_imported",
            entity_type="source_fetch_config",
            entity_id=config.id,
            message=f"Posts imported using fetch config '{config.fetch_name}'.",
            details={
                "result": result,
                "runtime_query_params": runtime_query_params,
            },
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))