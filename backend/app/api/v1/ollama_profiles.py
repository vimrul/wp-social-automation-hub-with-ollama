from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.ollama_profile import OllamaProfile
from app.schemas.ollama_profile import OllamaProfileCreate, OllamaProfileRead
from app.services.logs.activity_logger import log_activity

router = APIRouter(prefix="/ollama-profiles", tags=["Ollama Profiles"])


@router.post("", response_model=OllamaProfileRead)
def create_ollama_profile(payload: OllamaProfileCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["base_url"] = str(payload.base_url)
    profile = OllamaProfile(**data)
    db.add(profile)
    db.commit()
    db.refresh(profile)

    log_activity(
        db,
        event_type="ollama_profile_created",
        entity_type="ollama_profile",
        entity_id=profile.id,
        message=f"Ollama profile '{profile.name}' created.",
        details={"base_url": profile.base_url, "model_name": profile.model_name},
    )
    return profile


@router.get("", response_model=list[OllamaProfileRead])
def list_ollama_profiles(db: Session = Depends(get_db)):
    return db.query(OllamaProfile).order_by(OllamaProfile.id.desc()).all()
