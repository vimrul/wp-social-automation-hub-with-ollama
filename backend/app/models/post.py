from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from app.core.database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    source_site_id = Column(Integer, ForeignKey("source_sites.id", ondelete="CASCADE"), nullable=False)
    fetch_config_id = Column(Integer, ForeignKey("source_fetch_configs.id", ondelete="SET NULL"), nullable=True)

    external_post_id = Column(String(255), nullable=False, index=True)
    external_post_url = Column(String(1000), nullable=True)
    slug = Column(String(500), nullable=True, index=True)
    title = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)
    raw_content = Column(Text, nullable=True)
    clean_content = Column(Text, nullable=True)
    featured_image_url = Column(String(1000), nullable=True)

    categories_json = Column(Text, nullable=True)
    tags_json = Column(Text, nullable=True)

    status = Column(String(50), nullable=False, default="fetched")
    source_publish_status = Column(String(50), nullable=True)

    original_published_at = Column(DateTime(timezone=False), nullable=True)
    source_modified_at = Column(DateTime(timezone=False), nullable=True)

    first_fetched_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_fetched_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    content_hash = Column(String(255), nullable=True)
    is_deleted_in_source = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
