from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.ai_generation import AIGeneration
from app.models.post import Post
from app.models.source_fetch_config import SourceFetchConfig
from app.schemas.ai_generation import AIGenerationRead
from app.schemas.post import ImportPostsResponse, PostRead
from app.services.logs.activity_logger import log_activity
from app.services.source.import_service import import_posts_from_config

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.get("", response_model=list[PostRead])
def list_posts(db: Session = Depends(get_db)):
    return db.query(Post).order_by(Post.id.desc()).all()


@router.get("/{post_id}", response_model=PostRead)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


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
            }

    return {
        "post_id": post_id,
        "latest": latest,
    }


@router.post("/import/{config_id}", response_model=ImportPostsResponse)
async def import_posts(config_id: int, db: Session = Depends(get_db)):
    config = db.query(SourceFetchConfig).filter(SourceFetchConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Fetch config not found")

    result = await import_posts_from_config(db, config)

    log_activity(
        db,
        event_type="posts_imported",
        entity_type="source_fetch_config",
        entity_id=config.id,
        message=f"Posts imported using fetch config '{config.fetch_name}'.",
        details=result,
    )
    return result