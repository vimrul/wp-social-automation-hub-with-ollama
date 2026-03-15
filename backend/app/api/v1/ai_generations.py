from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.models.ai_generation import AIGeneration
from app.models.user import User
from app.schemas.ai_generation import (
    AIGenerationRead,
    GenerateContentRequest,
    GenerateContentResponse,
)
from app.services.ollama.generation_service import generate_content_for_post

router = APIRouter(prefix="/ai-generations", tags=["AI Generations"])


@router.get("", response_model=list[AIGenerationRead])
def list_ai_generations(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return db.query(AIGeneration).order_by(AIGeneration.id.desc()).all()


@router.post("/generate", response_model=GenerateContentResponse)
async def generate_content(
    payload: GenerateContentRequest,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles("editor", "admin", "superadmin")),
):
    try:
        generation = await generate_content_for_post(
            db,
            post_id=payload.post_id,
            ollama_profile_id=payload.ollama_profile_id,
            prompt_template_id=payload.prompt_template_id,
        )
        return {
            "success": True,
            "generation_id": generation.id,
            "generation_type": generation.generation_type,
            "output_text": generation.output_text or "",
            "message": "Content generated successfully",
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))