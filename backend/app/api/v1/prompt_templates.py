from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.prompt_template import PromptTemplate
from app.schemas.prompt_template import (
    PromptTemplateCreate,
    PromptTemplateRead,
    PromptTemplateUpdate,
)

router = APIRouter(prefix="/prompt-templates", tags=["Prompt Templates"])


@router.post("", response_model=PromptTemplateRead)
def create_prompt_template(payload: PromptTemplateCreate, db: Session = Depends(get_db)):
    row = PromptTemplate(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("", response_model=list[PromptTemplateRead])
def list_prompt_templates(db: Session = Depends(get_db)):
    return db.query(PromptTemplate).order_by(PromptTemplate.id.desc()).all()


@router.get("/{template_id}", response_model=PromptTemplateRead)
def get_prompt_template(template_id: int, db: Session = Depends(get_db)):
    row = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Prompt template not found")
    return row


@router.put("/{template_id}", response_model=PromptTemplateRead)
def update_prompt_template(template_id: int, payload: PromptTemplateUpdate, db: Session = Depends(get_db)):
    row = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Prompt template not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return row


@router.delete("/{template_id}")
def delete_prompt_template(template_id: int, db: Session = Depends(get_db)):
    row = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Prompt template not found")

    db.delete(row)
    db.commit()
    return {"message": "Prompt template deleted successfully"}