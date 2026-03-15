from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: str

    phone: Optional[str] = None
    photo_url: Optional[str] = None
    git_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    x_url: Optional[str] = None
    facebook_url: Optional[str] = None

    is_active: bool
    is_superuser: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "viewer"
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    git_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    x_url: Optional[str] = None
    facebook_url: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False


class UserProfileUpdate(BaseModel):
    full_name: str
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    git_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    x_url: Optional[str] = None
    facebook_url: Optional[str] = None