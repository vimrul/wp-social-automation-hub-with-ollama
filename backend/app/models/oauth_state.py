from sqlalchemy import Column, DateTime, Integer, String, Text, func
from app.core.database import Base


class OAuthState(Base):
    __tablename__ = "oauth_states"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False)
    state = Column(String(255), unique=True, nullable=False, index=True)
    code_verifier = Column(Text, nullable=True)
    redirect_after = Column(Text, nullable=True)
    source_site_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
