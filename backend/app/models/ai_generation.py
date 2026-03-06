from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from app.core.database import Base


class AIGeneration(Base):
    __tablename__ = "ai_generations"

    id = Column(Integer, primary_key=True, index=True)

    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    ollama_profile_id = Column(Integer, ForeignKey("ollama_profiles.id", ondelete="SET NULL"), nullable=True)
    prompt_template_id = Column(Integer, ForeignKey("prompt_templates.id", ondelete="SET NULL"), nullable=True)

    generation_type = Column(String(50), nullable=False)  # twitter_summary / facebook_summary / hashtags

    request_payload_json = Column(Text, nullable=True)
    response_payload_json = Column(Text, nullable=True)
    output_text = Column(Text, nullable=True)

    input_tokens_estimated = Column(Integer, nullable=True)
    output_tokens_estimated = Column(Integer, nullable=True)
    duration_ms = Column(Integer, nullable=True)

    status = Column(String(50), nullable=False, default="success")
    error_message = Column(Text, nullable=True)

    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)