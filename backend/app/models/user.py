from sqlalchemy import Boolean, Column, DateTime, Integer, String, func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="viewer")

    phone = Column(String(50), nullable=True)
    photo_url = Column(String(500), nullable=True)
    git_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    x_url = Column(String(500), nullable=True)
    facebook_url = Column(String(500), nullable=True)

    is_active = Column(Boolean, nullable=False, default=True)
    is_superuser = Column(Boolean, nullable=False, default=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )