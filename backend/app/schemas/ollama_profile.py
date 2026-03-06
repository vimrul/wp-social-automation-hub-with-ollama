from datetime import datetime
from typing import Optional
from pydantic import BaseModel, HttpUrl
from app.schemas.common import ORMBase


class OllamaProfileCreate(BaseModel):
    name: str
    base_url: HttpUrl
    model_name: str
    auth_type: str = "none"
    auth_username: Optional[str] = None
    auth_password_encrypted: Optional[str] = None
    auth_token_encrypted: Optional[str] = None
    custom_headers_json: Optional[str] = None
    timeout_seconds: int = 120
    is_default: bool = False
    is_active: bool = True
    notes: Optional[str] = None


class OllamaProfileRead(ORMBase):
    id: int
    name: str
    base_url: str
    model_name: str
    auth_type: str
    auth_username: Optional[str]
    custom_headers_json: Optional[str]
    timeout_seconds: int
    is_default: bool
    is_active: bool
    last_health_check_at: Optional[datetime]
    last_health_status: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
