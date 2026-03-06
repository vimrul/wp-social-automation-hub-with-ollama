from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from app.core.database import Base


class PostContentVersion(Base):
    __tablename__ = "post_content_versions"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    version_type = Column(String(50), nullable=False)
    content_text = Column(Text, nullable=True)
    content_json = Column(Text, nullable=True)
    version_number = Column(Integer, nullable=False, default=1)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
