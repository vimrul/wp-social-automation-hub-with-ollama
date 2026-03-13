from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.common import ORMBase


class SocialAccountCreate(BaseModel):
    name: str
    platform: str
    source_site_id: Optional[int] = None
    account_identifier: Optional[str] = None
    page_id: Optional[str] = None
    app_id: Optional[str] = None
    app_secret: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    account_metadata_json: Optional[str] = None
    is_active: bool = True


class SocialAccountUpdate(BaseModel):
    name: str
    platform: str
    source_site_id: Optional[int] = None
    account_identifier: Optional[str] = None
    page_id: Optional[str] = None
    app_id: Optional[str] = None
    app_secret: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    account_metadata_json: Optional[str] = None
    is_active: bool = True


class SocialAccountRead(ORMBase):
    id: int
    name: str
    platform: str
    source_site_id: Optional[int]
    account_identifier: Optional[str]
    page_id: Optional[str]
    app_id: Optional[str]
    client_id: Optional[str]
    account_metadata_json: Optional[str]
    is_active: bool
    last_validated_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    app_secret_configured: bool
    client_secret_configured: bool
    access_token_configured: bool
    refresh_token_configured: bool


class SocialAccountValidateResponse(BaseModel):
    success: bool
    platform: str
    social_account_id: int
    message: str