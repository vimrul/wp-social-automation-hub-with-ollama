from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.common import ORMBase


class PromptTemplateCreate(BaseModel):
    name: str
    template_type: str
    platform: Optional[str] = None
    source_site_id: Optional[int] = None
    ollama_profile_id: Optional[int] = None
    system_prompt: Optional[str] = None
    user_prompt_template: str
    max_output_length: Optional[int] = None
    temperature: Optional[str] = None
    is_active: bool = True


class PromptTemplateUpdate(BaseModel):
    name: Optional[str] = None
    template_type: Optional[str] = None
    platform: Optional[str] = None
    source_site_id: Optional[int] = None
    ollama_profile_id: Optional[int] = None
    system_prompt: Optional[str] = None
    user_prompt_template: Optional[str] = None
    max_output_length: Optional[int] = None
    temperature: Optional[str] = None
    is_active: Optional[bool] = None


class PromptTemplateRead(ORMBase):
    id: int
    name: str
    template_type: str
    platform: Optional[str]
    source_site_id: Optional[int]
    ollama_profile_id: Optional[int]
    system_prompt: Optional[str]
    user_prompt_template: str
    max_output_length: Optional[int]
    temperature: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime