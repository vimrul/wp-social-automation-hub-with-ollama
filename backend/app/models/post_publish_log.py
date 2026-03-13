from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from app.core.database import Base


class PostPublishLog(Base):
    __tablename__ = "post_publish_logs"

    id = Column(Integer, primary_key=True, index=True)

    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    social_account_id = Column(Integer, ForeignKey("social_accounts.id", ondelete="SET NULL"), nullable=True)

    platform = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)  # success / failed

    published_id = Column(String(255), nullable=True)
    published_url = Column(Text, nullable=True)

    content_text = Column(Text, nullable=True)
    hashtags = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
