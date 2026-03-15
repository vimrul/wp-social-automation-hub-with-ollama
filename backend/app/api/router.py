from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.source_sites import router as source_sites_router
from app.api.v1.source_fetch_configs import router as source_fetch_configs_router
from app.api.v1.ollama_profiles import router as ollama_profiles_router
from app.api.v1.activity_logs import router as activity_logs_router
from app.api.v1.posts import router as posts_router
from app.api.v1.prompt_templates import router as prompt_templates_router
from app.api.v1.ai_generations import router as ai_generations_router
from app.api.v1.social_accounts import router as social_accounts_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.publishing import router as publishing_router
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.oauth import router as oauth_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(health_router)
api_router.include_router(source_sites_router)
api_router.include_router(source_fetch_configs_router)
api_router.include_router(ollama_profiles_router)
api_router.include_router(activity_logs_router)
api_router.include_router(posts_router)
api_router.include_router(prompt_templates_router)
api_router.include_router(ai_generations_router)
api_router.include_router(social_accounts_router)
api_router.include_router(dashboard_router)
api_router.include_router(publishing_router)
api_router.include_router(oauth_router)
