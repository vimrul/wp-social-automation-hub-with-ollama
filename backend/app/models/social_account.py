from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from app.core.database import Base


class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)
    platform = Column(String(50), nullable=False)  # twitter / facebook
    source_site_id = Column(Integer, ForeignKey("source_sites.id", ondelete="SET NULL"), nullable=True)

    account_identifier = Column(String(255), nullable=True)
    page_id = Column(String(255), nullable=True)

    app_id = Column(String(255), nullable=True)
    app_secret_encrypted = Column(Text, nullable=True)

    client_id = Column(String(255), nullable=True)
    client_secret_encrypted = Column(Text, nullable=True)

    access_token_encrypted = Column(Text, nullable=True)
    refresh_token_encrypted = Column(Text, nullable=True)

    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    account_metadata_json = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    last_validated_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
