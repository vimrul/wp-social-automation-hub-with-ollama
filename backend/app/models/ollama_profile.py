from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func
from app.core.database import Base


class OllamaProfile(Base):
    __tablename__ = "ollama_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    base_url = Column(String(1000), nullable=False)
    model_name = Column(String(255), nullable=False)

    auth_type = Column(String(50), nullable=False, default="none")
    auth_username = Column(String(255), nullable=True)
    auth_password_encrypted = Column(Text, nullable=True)
    auth_token_encrypted = Column(Text, nullable=True)
    custom_headers_json = Column(Text, nullable=True)

    timeout_seconds = Column(Integer, nullable=False, default=120)
    is_default = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    last_health_check_at = Column(DateTime(timezone=True), nullable=True)
    last_health_status = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
