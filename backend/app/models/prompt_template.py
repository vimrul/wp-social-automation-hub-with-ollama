from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from app.core.database import Base


class PromptTemplate(Base):
    __tablename__ = "prompt_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    template_type = Column(String(50), nullable=False)  # twitter_summary / facebook_summary / hashtags
    platform = Column(String(50), nullable=True)

    source_site_id = Column(Integer, ForeignKey("source_sites.id", ondelete="SET NULL"), nullable=True)
    ollama_profile_id = Column(Integer, ForeignKey("ollama_profiles.id", ondelete="SET NULL"), nullable=True)

    system_prompt = Column(Text, nullable=True)
    user_prompt_template = Column(Text, nullable=False)

    max_output_length = Column(Integer, nullable=True)
    temperature = Column(String(20), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)