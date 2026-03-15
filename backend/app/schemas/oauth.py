from pydantic import BaseModel


class OAuthConnectResponse(BaseModel):
    authorization_url: str


class OAuthCallbackResult(BaseModel):
    success: bool
    provider: str
    social_account_id: int
    message: str
    redirect_url: str
