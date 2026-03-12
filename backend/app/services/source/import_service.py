import json
from datetime import datetime
from typing import Any, Dict, Optional

import httpx
from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.post_content_version import PostContentVersion
from app.models.source_fetch_config import SourceFetchConfig
from app.services.source.fetch_service import _extract_by_path, _extract_field, _safe_json_loads
from app.utils.datetime_utils import parse_datetime
from app.utils.hashing import generate_content_hash
from app.utils.html_cleaner import strip_html


def _extract_featured_image(item: Dict[str, Any], configured_value: Any) -> Any:
    if configured_value:
        return configured_value

    yoast_image = _extract_by_path(item, "yoast_head_json.og_image.0.url")
    if yoast_image:
        return yoast_image

    return item.get("jetpack_featured_media_url")


async def import_posts_from_config(
    db: Session,
    config: SourceFetchConfig,
    runtime_query_params: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    headers = _safe_json_loads(config.request_headers_json, {})
    saved_params = _safe_json_loads(config.query_params_json, {})
    params = saved_params.copy()

    if runtime_query_params:
        params.update(runtime_query_params)

    auth = None

    if config.auth_type == "bearer" and config.auth_token_encrypted:
        headers["Authorization"] = f"Bearer {config.auth_token_encrypted}"
    elif config.auth_type == "basic" and config.auth_username and config.auth_password_encrypted:
        auth = (config.auth_username, config.auth_password_encrypted)

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        response = await client.request(
            method=config.http_method.upper(),
            url=config.fetch_url,
            headers=headers,
            params=params,
            auth=auth,
        )
        response.raise_for_status()
        data = response.json()

    extracted = _extract_by_path(data, config.content_path)

    if isinstance(extracted, list):
        items = extracted
    elif isinstance(extracted, dict):
        items = [extracted]
    else:
        items = []

    created_count = 0
    updated_count = 0
    skipped_count = 0

    for item in items:
        if not isinstance(item, dict):
            skipped_count += 1
            continue

        external_id = _extract_field(item, config.source_id_field)
        title = _extract_field(item, config.title_field)
        slug = _extract_field(item, config.slug_field)
        raw_content = _extract_field(item, config.content_field)
        excerpt = _extract_field(item, config.excerpt_field)
        published_at = _extract_field(item, config.published_at_field)
        modified_at = _extract_field(item, config.modified_at_field)
        configured_featured_image = _extract_field(item, config.featured_image_field)
        featured_image = _extract_featured_image(item, configured_featured_image)
        status = _extract_field(item, config.status_field)
        categories = _extract_field(item, config.category_field)
        tags = _extract_field(item, config.tag_field)
        link = item.get("link")

        clean_content = strip_html(raw_content)
        clean_excerpt = strip_html(excerpt)

        if external_id is None or not title:
            skipped_count += 1
            continue

        content_hash = generate_content_hash(
            str(title or ""),
            str(raw_content or ""),
            str(clean_excerpt or ""),
            str(modified_at or ""),
        )

        existing_post = (
            db.query(Post)
            .filter(
                Post.source_site_id == config.source_site_id,
                Post.external_post_id == str(external_id),
            )
            .first()
        )

        if existing_post:
            if existing_post.content_hash == content_hash:
                existing_post.last_fetched_at = datetime.utcnow()
                skipped_count += 1
                continue

            existing_post.external_post_url = link
            existing_post.slug = slug
            existing_post.title = title
            existing_post.excerpt = clean_excerpt
            existing_post.raw_content = raw_content
            existing_post.clean_content = clean_content
            existing_post.featured_image_url = featured_image
            existing_post.categories_json = json.dumps(categories) if categories is not None else None
            existing_post.tags_json = json.dumps(tags) if tags is not None else None
            existing_post.source_publish_status = status
            existing_post.original_published_at = parse_datetime(published_at)
            existing_post.source_modified_at = parse_datetime(modified_at)
            existing_post.content_hash = content_hash
            existing_post.fetch_config_id = config.id
            existing_post.last_fetched_at = datetime.utcnow()

            updated_count += 1

            latest_version = (
                db.query(PostContentVersion)
                .filter(PostContentVersion.post_id == existing_post.id)
                .order_by(PostContentVersion.version_number.desc())
                .first()
            )
            next_version = 1 if not latest_version else latest_version.version_number + 1

            db.add(
                PostContentVersion(
                    post_id=existing_post.id,
                    version_type="raw",
                    content_text=raw_content,
                    content_json=json.dumps(item),
                    version_number=next_version,
                )
            )
        else:
            new_post = Post(
                source_site_id=config.source_site_id,
                fetch_config_id=config.id,
                external_post_id=str(external_id),
                external_post_url=link,
                slug=slug,
                title=title,
                excerpt=clean_excerpt,
                raw_content=raw_content,
                clean_content=clean_content,
                featured_image_url=featured_image,
                categories_json=json.dumps(categories) if categories is not None else None,
                tags_json=json.dumps(tags) if tags is not None else None,
                source_publish_status=status,
                original_published_at=parse_datetime(published_at),
                source_modified_at=parse_datetime(modified_at),
                content_hash=content_hash,
                status="fetched",
            )
            db.add(new_post)
            db.flush()

            db.add(
                PostContentVersion(
                    post_id=new_post.id,
                    version_type="raw",
                    content_text=raw_content,
                    content_json=json.dumps(item),
                    version_number=1,
                )
            )
            created_count += 1

    db.commit()

    return {
        "success": True,
        "fetched_count": len(items),
        "created_count": created_count,
        "updated_count": updated_count,
        "skipped_count": skipped_count,
        "message": "Posts imported successfully",
        "applied_query_params": params,
    }