from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.common import ORMBase


class AIGenerationRead(ORMBase):
    id: int
    post_id: int
    ollama_profile_id: Optional[int]
    prompt_template_id: Optional[int]
    generation_type: str
    request_payload_json: Optional[str]
    response_payload_json: Optional[str]
    output_text: Optional[str]
    input_tokens_estimated: Optional[int]
    output_tokens_estimated: Optional[int]
    duration_ms: Optional[int]
    status: str
    error_message: Optional[str]
    generated_at: datetime


class GenerateContentRequest(BaseModel):
    post_id: int
    ollama_profile_id: int
    prompt_template_id: int


class GenerateContentResponse(BaseModel):
    success: bool
    generation_id: int
    generation_type: str
    output_text: str
    message: str
