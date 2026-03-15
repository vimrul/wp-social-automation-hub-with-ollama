from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "wp-social-automation-hub"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    FIELD_ENCRYPTION_KEY: str

    FRONTEND_BASE_URL: str = "http://localhost:5173"

    X_CLIENT_ID: str = ""
    X_CLIENT_SECRET: str = ""
    X_CALLBACK_URL: str = "http://127.0.0.1:8000/api/v1/oauth/x/callback"

    FACEBOOK_CLIENT_ID: str = ""
    FACEBOOK_CLIENT_SECRET: str = ""
    FACEBOOK_CALLBACK_URL: str = "http://127.0.0.1:8000/api/v1/oauth/facebook/callback"

    X_SCOPES: str = "tweet.read tweet.write users.read offline.access"
    FACEBOOK_SCOPES: str = "pages_manage_posts,pages_read_engagement"


settings = Settings()