from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, HttpUrl
from app.schemas.common import ORMBase


class SourceFetchConfigCreate(BaseModel):
    source_site_id: int
    fetch_name: str
    fetch_url: HttpUrl
    http_method: str = "GET"
    auth_type: str = "none"
    auth_username: Optional[str] = None
    auth_password_encrypted: Optional[str] = None
    auth_token_encrypted: Optional[str] = None
    request_headers_json: Optional[str] = None
    query_params_json: Optional[str] = None
    content_path: Optional[str] = None
    title_field: Optional[str] = None
    slug_field: Optional[str] = None
    content_field: Optional[str] = None
    excerpt_field: Optional[str] = None
    published_at_field: Optional[str] = None
    modified_at_field: Optional[str] = None
    featured_image_field: Optional[str] = None
    source_id_field: Optional[str] = None
    status_field: Optional[str] = None
    category_field: Optional[str] = None
    tag_field: Optional[str] = None
    is_active: bool = True


class SourceFetchConfigUpdate(BaseModel):
    fetch_name: Optional[str] = None
    fetch_url: Optional[HttpUrl] = None
    http_method: Optional[str] = None
    auth_type: Optional[str] = None
    auth_username: Optional[str] = None
    auth_password_encrypted: Optional[str] = None
    auth_token_encrypted: Optional[str] = None
    request_headers_json: Optional[str] = None
    query_params_json: Optional[str] = None
    content_path: Optional[str] = None
    title_field: Optional[str] = None
    slug_field: Optional[str] = None
    content_field: Optional[str] = None
    excerpt_field: Optional[str] = None
    published_at_field: Optional[str] = None
    modified_at_field: Optional[str] = None
    featured_image_field: Optional[str] = None
    source_id_field: Optional[str] = None
    status_field: Optional[str] = None
    category_field: Optional[str] = None
    tag_field: Optional[str] = None
    is_active: Optional[bool] = None


class SourceFetchConfigRead(ORMBase):
    id: int
    source_site_id: int
    fetch_name: str
    fetch_url: str
    http_method: str
    auth_type: str
    auth_username: Optional[str]
    request_headers_json: Optional[str]
    query_params_json: Optional[str]
    content_path: Optional[str]
    title_field: Optional[str]
    slug_field: Optional[str]
    content_field: Optional[str]
    excerpt_field: Optional[str]
    published_at_field: Optional[str]
    modified_at_field: Optional[str]
    featured_image_field: Optional[str]
    source_id_field: Optional[str]
    status_field: Optional[str]
    category_field: Optional[str]
    tag_field: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class FetchTestResponse(BaseModel):
    success: bool
    status_code: int
    item_count: int
    extracted_items_preview: List[Dict[str, Any]]
    raw_preview: Any
    error_message: Optional[str] = None
