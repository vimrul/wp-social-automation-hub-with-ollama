from typing import Optional

from pydantic import BaseModel


class PublishPostRequest(BaseModel):
    post_id: int
    social_account_id: int
    content_text: Optional[str] = None
    hashtags: Optional[str] = None


class PublishPostResponse(BaseModel):
    success: bool
    platform: str
    social_account_id: int
    post_id: int
    published_id: Optional[str] = None
    published_url: Optional[str] = None
    message: str