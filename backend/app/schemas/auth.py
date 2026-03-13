from pydantic import BaseModel, ConfigDict, EmailStr

from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class AuthMeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user: UserRead