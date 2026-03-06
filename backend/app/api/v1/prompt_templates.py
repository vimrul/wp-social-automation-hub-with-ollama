from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.prompt_template import PromptTemplate
from app.schemas.prompt_template import PromptTemplateCreate, PromptTemplateRead

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
