from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PostListRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source_site_id: int
    fetch_config_id: Optional[int] = None
    external_post_id: Optional[str] = None
    external_post_url: Optional[str] = None
    slug: Optional[str] = None
    title: str
    excerpt: Optional[str] = None
    featured_image_url: Optional[str] = None
    status: Optional[str] = None
    source_publish_status: Optional[str] = None
    original_published_at: Optional[datetime] = None
    last_fetched_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class PostRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source_site_id: int
    fetch_config_id: Optional[int] = None
    external_post_id: Optional[str] = None
    external_post_url: Optional[str] = None
    slug: Optional[str] = None
    title: str
    excerpt: Optional[str] = None
    raw_content: Optional[str] = None
    clean_content: Optional[str] = None
    featured_image_url: Optional[str] = None
    categories_json: Optional[str] = None
    tags_json: Optional[str] = None
    status: Optional[str] = None
    source_publish_status: Optional[str] = None
    original_published_at: Optional[datetime] = None
    source_modified_at: Optional[datetime] = None
    first_fetched_at: Optional[datetime] = None
    last_fetched_at: Optional[datetime] = None
    content_hash: Optional[str] = None
    is_deleted_in_source: Optional[bool] = None
    created_at: datetime
    updated_at: datetime


class ImportPostsResponse(BaseModel):
    success: bool
    fetched_count: int
    created_count: int
    updated_count: int
    skipped_count: int
    message: str


class PaginatedPostsResponse(BaseModel):
    items: list[PostListRead]
    total: int
    limit: int
    offset: int