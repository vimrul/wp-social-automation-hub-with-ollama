from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PostPublishLogRead(BaseModel):
    id: int
    post_id: int
    social_account_id: Optional[int] = None
    platform: str
    status: str
    published_id: Optional[str] = None
    published_url: Optional[str] = None
    content_text: Optional[str] = None
    hashtags: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True
