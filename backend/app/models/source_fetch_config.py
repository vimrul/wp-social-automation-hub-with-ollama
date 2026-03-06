from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from app.core.database import Base


class SourceFetchConfig(Base):
    __tablename__ = "source_fetch_configs"

    id = Column(Integer, primary_key=True, index=True)
    source_site_id = Column(Integer, ForeignKey("source_sites.id", ondelete="CASCADE"), nullable=False)

    fetch_name = Column(String(255), nullable=False)
    fetch_url = Column(String(1000), nullable=False)
    http_method = Column(String(20), nullable=False, default="GET")

    auth_type = Column(String(50), nullable=False, default="none")
    auth_username = Column(String(255), nullable=True)
    auth_password_encrypted = Column(Text, nullable=True)
    auth_token_encrypted = Column(Text, nullable=True)

    request_headers_json = Column(Text, nullable=True)
    query_params_json = Column(Text, nullable=True)

    content_path = Column(String(500), nullable=True)
    title_field = Column(String(255), nullable=True)
    slug_field = Column(String(255), nullable=True)
    content_field = Column(String(255), nullable=True)
    excerpt_field = Column(String(255), nullable=True)
    published_at_field = Column(String(255), nullable=True)
    modified_at_field = Column(String(255), nullable=True)
    featured_image_field = Column(String(255), nullable=True)
    source_id_field = Column(String(255), nullable=True)
    status_field = Column(String(255), nullable=True)
    category_field = Column(String(255), nullable=True)
    tag_field = Column(String(255), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    last_tested_at = Column(DateTime(timezone=True), nullable=True)
    last_success_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
