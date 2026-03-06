from datetime import datetime
from typing import Optional
from pydantic import BaseModel, HttpUrl
from app.schemas.common import ORMBase


class SourceSiteCreate(BaseModel):
    name: str
    base_url: HttpUrl
    site_type: str = "custom"
    description: Optional[str] = None
    default_language: Optional[str] = None
    timezone: Optional[str] = None
    is_active: bool = True


class SourceSiteUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[HttpUrl] = None
    site_type: Optional[str] = None
    description: Optional[str] = None
    default_language: Optional[str] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None


class SourceSiteRead(ORMBase):
    id: int
    name: str
    base_url: str
    site_type: str
    description: Optional[str]
    default_language: Optional[str]
    timezone: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
