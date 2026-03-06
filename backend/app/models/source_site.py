from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func
from app.core.database import Base


class SourceSite(Base):
    __tablename__ = "source_sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    base_url = Column(String(500), nullable=False)
    site_type = Column(String(100), nullable=False, default="custom")
    description = Column(Text, nullable=True)
    default_language = Column(String(50), nullable=True)
    timezone = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
