import os
from datetime import datetime
from sqlalchemy import create_engine, inspect, text
from passlib.context import CryptContext

DATABASE_URL = os.environ["DATABASE_URL"]
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@example.com")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "Admin123!")
DEFAULT_ADMIN_USERNAME = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_FULL_NAME = os.getenv("DEFAULT_ADMIN_FULL_NAME", "Administrator")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
engine = create_engine(DATABASE_URL)


def scalar(conn, sql, params=None):
    return conn.execute(text(sql), params or {}).scalar()


def row(conn, sql, params=None):
    return conn.execute(text(sql), params or {}).fetchone()


def ensure_source_site(conn):
    existing = row(conn, "select id from source_sites where name=:name", {"name": "Revlox"})
    if existing:
        return existing[0]
    site_id = scalar(
        conn,
        """
        insert into source_sites
          (name, base_url, site_type, description, default_language, timezone, is_active)
        values
          (:name, :base_url, :site_type, :description, :default_language, :timezone, :is_active)
        returning id
        """,
        {
            "name": "Revlox",
            "base_url": "https://www.revlox.com",
            "site_type": "wordpress",
            "description": "Default seeded source site",
            "default_language": "en",
            "timezone": "Asia/Dhaka",
            "is_active": True,
        },
    )
    print(f"[seed] source_site created id={site_id}")
    return site_id


def ensure_fetch_config(conn, site_id):
    existing = row(conn, "select id from source_fetch_configs where fetch_name=:name", {"name": "Revlox"})
    if existing:
        return existing[0]
    config_id = scalar(
        conn,
        """
        insert into source_fetch_configs
          (source_site_id, fetch_name, fetch_url, http_method, auth_type,
           request_headers_json, query_params_json, content_path,
           title_field, slug_field, content_field, excerpt_field,
           published_at_field, modified_at_field, featured_image_field,
           source_id_field, status_field, category_field, tag_field, is_active)
        values
          (:source_site_id, :fetch_name, :fetch_url, 'GET', 'none',
           null, null, :content_path,
           :title_field, :slug_field, :content_field, :excerpt_field,
           :published_at_field, :modified_at_field, :featured_image_field,
           :source_id_field, :status_field, :category_field, :tag_field, true)
        returning id
        """,
        {
            "source_site_id": site_id,
            "fetch_name": "Revlox",
            "fetch_url": "https://www.revlox.com/wp-json/wp/v2/posts",
            "content_path": "$",
            "title_field": "title.rendered",
            "slug_field": "slug",
            "content_field": "content.rendered",
            "excerpt_field": "excerpt.rendered",
            "published_at_field": "date",
            "modified_at_field": "modified",
            "featured_image_field": "jetpack_featured_media_url",
            "source_id_field": "id",
            "status_field": "status",
            "category_field": "categories",
            "tag_field": "tags",
        },
    )
    print(f"[seed] source_fetch_config created id={config_id}")
    return config_id


def ensure_ollama_profile(conn):
    existing = row(conn, "select id from ollama_profiles where name=:name", {"name": "Default Ollama"})
    if existing:
        return existing[0]
    profile_id = scalar(
        conn,
        """
        insert into ollama_profiles
          (name, base_url, model_name, auth_type, timeout_seconds, is_default, is_active, notes)
        values
          (:name, :base_url, :model_name, 'none', 120, true, true, :notes)
        returning id
        """,
        {
            "name": "Default Ollama",
            "base_url": OLLAMA_BASE_URL,
            "model_name": "llama3.1:8b",
            "notes": "Auto-seeded production profile",
        },
    )
    print(f"[seed] ollama_profile created id={profile_id}")
    return profile_id


def ensure_prompt_templates(conn, site_id, profile_id):
    templates = [
        (
            "Twitter Summary Default",
            "twitter_summary",
            "twitter",
            "You are writing a concise, engaging post for X.",
            "Create a short social post for X from this article. Title: {{title}}\nExcerpt: {{excerpt}}\nURL: {{url}}",
            280,
            "0.7",
        ),
        (
            "Facebook Summary Default",
            "facebook_summary",
            "facebook",
            "You are writing a clear and engaging Facebook post.",
            "Create a Facebook post from this article. Title: {{title}}\nExcerpt: {{excerpt}}\nURL: {{url}}",
            1200,
            "0.7",
        ),
        (
            "Hashtags Default",
            "hashtags",
            None,
            "Generate relevant hashtags only.",
            "Generate 8 relevant hashtags for this article. Title: {{title}}\nExcerpt: {{excerpt}}",
            200,
            "0.5",
        ),
    ]
    for name, template_type, platform, system_prompt, user_prompt, max_len, temp in templates:
        exists = row(conn, "select id from prompt_templates where name=:name", {"name": name})
        if exists:
            continue
        conn.execute(
            text(
                """
                insert into prompt_templates
                  (name, template_type, platform, source_site_id, ollama_profile_id,
                   system_prompt, user_prompt_template, max_output_length, temperature, is_active)
                values
                  (:name, :template_type, :platform, :source_site_id, :ollama_profile_id,
                   :system_prompt, :user_prompt_template, :max_output_length, :temperature, true)
                """
            ),
            {
                "name": name,
                "template_type": template_type,
                "platform": platform,
                "source_site_id": site_id,
                "ollama_profile_id": profile_id,
                "system_prompt": system_prompt,
                "user_prompt_template": user_prompt,
                "max_output_length": max_len,
                "temperature": temp,
            },
        )
        print(f"[seed] prompt_template created name={name}")


def ensure_admin_user(conn):
    inspector = inspect(conn)
    if "users" not in inspector.get_table_names():
        print("[seed] users table not found, skipping admin seed")
        return

    columns = {col["name"] for col in inspector.get_columns("users")}
    if "email" not in columns:
        print("[seed] users table has no email column, skipping admin seed")
        return

    existing = row(conn, "select 1 from users where email=:email limit 1", {"email": DEFAULT_ADMIN_EMAIL})
    if existing:
        print(f"[seed] admin already exists: {DEFAULT_ADMIN_EMAIL}")
        return

    payload = {}
    if "email" in columns:
        payload["email"] = DEFAULT_ADMIN_EMAIL
    if "username" in columns:
        payload["username"] = DEFAULT_ADMIN_USERNAME
    if "full_name" in columns:
        payload["full_name"] = DEFAULT_ADMIN_FULL_NAME
    if "hashed_password" in columns:
        payload["hashed_password"] = pwd_context.hash(DEFAULT_ADMIN_PASSWORD)
    if "is_active" in columns:
        payload["is_active"] = True
    if "is_superuser" in columns:
        payload["is_superuser"] = True
    if "created_at" in columns:
        payload["created_at"] = datetime.utcnow()
    if "updated_at" in columns:
        payload["updated_at"] = datetime.utcnow()

    cols = ", ".join(payload.keys())
    vals = ", ".join(f":{k}" for k in payload.keys())
    conn.execute(text(f"insert into users ({cols}) values ({vals})"), payload)
    print(f"[seed] admin created: {DEFAULT_ADMIN_EMAIL}")


with engine.begin() as conn:
    tables = set(inspect(conn).get_table_names())
    required = {"source_sites", "source_fetch_configs", "ollama_profiles", "prompt_templates"}
    missing = required - tables
    if missing:
        raise RuntimeError(f"Missing expected tables after migration: {sorted(missing)}")

    site_id = ensure_source_site(conn)
    ensure_fetch_config(conn, site_id)
    profile_id = ensure_ollama_profile(conn)
    ensure_prompt_templates(conn, site_id, profile_id)
    ensure_admin_user(conn)

print("[seed] completed")
