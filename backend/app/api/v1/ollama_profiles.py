from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.ollama_profile import OllamaProfile
from app.schemas.ollama_profile import (
    OllamaProfileCreate,
    OllamaProfileRead,
    OllamaProfileUpdate,
)
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


@router.get("/{profile_id}", response_model=OllamaProfileRead)
def get_ollama_profile(profile_id: int, db: Session = Depends(get_db)):
    profile = db.query(OllamaProfile).filter(OllamaProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Ollama profile not found")
    return profile


@router.put("/{profile_id}", response_model=OllamaProfileRead)
def update_ollama_profile(profile_id: int, payload: OllamaProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(OllamaProfile).filter(OllamaProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Ollama profile not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "base_url" in update_data and update_data["base_url"] is not None:
        update_data["base_url"] = str(update_data["base_url"])

    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    log_activity(
        db,
        event_type="ollama_profile_updated",
        entity_type="ollama_profile",
        entity_id=profile.id,
        message=f"Ollama profile '{profile.name}' updated.",
        details={"updated_fields": list(update_data.keys())},
    )
    return profile


@router.delete("/{profile_id}")
def delete_ollama_profile(profile_id: int, db: Session = Depends(get_db)):
    profile = db.query(OllamaProfile).filter(OllamaProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Ollama profile not found")

    profile_name = profile.name
    db.delete(profile)
    db.commit()

    log_activity(
        db,
        event_type="ollama_profile_deleted",
        entity_type="ollama_profile",
        entity_id=profile_id,
        message=f"Ollama profile '{profile_name}' deleted.",
    )
    return {"message": "Ollama profile deleted successfully"}