import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def table_exists(session, table_name: str) -> bool:
    query = text("""
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_name = :table_name
        )
    """)
    return bool(session.execute(query, {"table_name": table_name}).scalar())


def seed_source_site(session):
    if not table_exists(session, "source_sites"):
        return

    exists = session.execute(
        text("SELECT id FROM source_sites WHERE base_url = :base_url LIMIT 1"),
        {"base_url": "https://www.revlox.com"},
    ).scalar()

    if not exists:
        session.execute(
            text("""
                INSERT INTO source_sites
                (name, base_url, site_type, default_language, is_active)
                VALUES
                (:name, :base_url, :site_type, :default_language, :is_active)
            """),
            {
                "name": "Revlox",
                "base_url": "https://www.revlox.com",
                "site_type": "wordpress",
                "default_language": "en",
                "is_active": True,
            },
        )


def seed_prompt_templates(session):
    if not table_exists(session, "prompt_templates"):
        return

    templates = [
        {
            "name": "Twitter Summary",
            "template_type": "summary",
            "platform": "twitter",
            "system_prompt": "You write concise, engaging social media copy.",
            "user_prompt_template": "Create a short Twitter-ready summary for this post:\n\nTitle: {title}\n\nContent: {content}",
            "max_output_length": 400,
            "temperature": "0.7",
            "is_active": True,
        },
        {
            "name": "Hashtag Generator",
            "template_type": "hashtags",
            "platform": "twitter",
            "system_prompt": "Generate clean and relevant hashtags only.",
            "user_prompt_template": "Generate relevant hashtags for this post:\n\nTitle: {title}\n\nContent: {content}",
            "max_output_length": 200,
            "temperature": "0.5",
            "is_active": True,
        },
    ]

    for tpl in templates:
        exists = session.execute(
            text("SELECT id FROM prompt_templates WHERE name = :name LIMIT 1"),
            {"name": tpl["name"]},
        ).scalar()

        if not exists:
            session.execute(
                text("""
                    INSERT INTO prompt_templates
                    (name, template_type, platform, system_prompt, user_prompt_template, max_output_length, temperature, is_active)
                    VALUES
                    (:name, :template_type, :platform, :system_prompt, :user_prompt_template, :max_output_length, :temperature, :is_active)
                """),
                tpl,
            )


def seed_default_admin(session):
    if not table_exists(session, "users"):
        return

    email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@example.com")
    password_hash = os.getenv("DEFAULT_ADMIN_PASSWORD_HASH")

    if not password_hash:
        print("DEFAULT_ADMIN_PASSWORD_HASH not provided; skipping admin seed.")
        return

    exists = session.execute(
        text("SELECT id FROM users WHERE email = :email LIMIT 1"),
        {"email": email},
    ).scalar()

    if not exists:
        session.execute(
            text("""
                INSERT INTO users
                (email, full_name, hashed_password, is_active, is_superuser)
                VALUES
                (:email, :full_name, :hashed_password, :is_active, :is_superuser)
            """),
            {
                "email": email,
                "full_name": "Administrator",
                "hashed_password": password_hash,
                "is_active": True,
                "is_superuser": True,
            },
        )


def main():
    db = SessionLocal()
    try:
        seed_source_site(db)
        seed_prompt_templates(db)
        seed_default_admin(db)
        db.commit()
        print("Seed completed.")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
