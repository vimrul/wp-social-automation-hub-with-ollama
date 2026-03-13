from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

from app.core.config import settings
from app.core.database import Base

# Import all models here so Alembic can detect them
from app.models.source_site import SourceSite
from app.models.source_fetch_config import SourceFetchConfig
from app.models.ollama_profile import OllamaProfile
from app.models.activity_log import ActivityLog
from app.models.post import Post
from app.models.post_content_version import PostContentVersion
from app.models.prompt_template import PromptTemplate
from app.models.ai_generation import AIGeneration
from app.models.social_account import SocialAccount
from app.models.post_publish_log import PostPublishLog

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
from app.models.post import Post
from app.models.post_content_version import PostContentVersion
