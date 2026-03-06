from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.common import ORMBase


class PostRead(ORMBase):
    id: int
    source_site_id: int
    fetch_config_id: Optional[int]
    external_post_id: str
    external_post_url: Optional[str]
    slug: Optional[str]
    title: str
    excerpt: Optional[str]
    raw_content: Optional[str]
    clean_content: Optional[str]
    featured_image_url: Optional[str]
    categories_json: Optional[str]
    tags_json: Optional[str]
    status: str
    source_publish_status: Optional[str]
    original_published_at: Optional[datetime]
    source_modified_at: Optional[datetime]
    first_fetched_at: datetime
    last_fetched_at: datetime
    content_hash: Optional[str]
    is_deleted_in_source: bool
    created_at: datetime
    updated_at: datetime


class ImportPostsResponse(BaseModel):
    success: bool
    fetched_count: int
    created_count: int
    updated_count: int
    skipped_count: int
    message: str
