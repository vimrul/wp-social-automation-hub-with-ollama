import json
from typing import Any, Dict, List, Optional

import httpx

from app.models.source_fetch_config import SourceFetchConfig


def _safe_json_loads(value: Optional[str], default):
    if not value:
        return default
    try:
        return json.loads(value)
    except Exception:
        return default


def _extract_by_path(data: Any, path: Optional[str]) -> Any:
    if not path:
        return data

    current = data
    for part in path.split("."):
        if isinstance(current, dict):
            current = current.get(part)
        elif isinstance(current, list):
            try:
                index = int(part)
                current = current[index]
            except Exception:
                return None
        else:
            return None
    return current


def _extract_field(item: Dict[str, Any], field_name: Optional[str]) -> Any:
    if not field_name:
        return None
    return _extract_by_path(item, field_name)


async def test_fetch_config(config: SourceFetchConfig) -> Dict[str, Any]:
    headers = _safe_json_loads(config.request_headers_json, {})
    params = _safe_json_loads(config.query_params_json, {})

    auth = None

    if config.auth_type == "bearer" and config.auth_token_encrypted:
        headers["Authorization"] = f"Bearer {config.auth_token_encrypted}"

    elif config.auth_type == "basic" and config.auth_username and config.auth_password_encrypted:
        auth = (config.auth_username, config.auth_password_encrypted)

    timeout = 30.0

    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
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

        preview_items: List[Dict[str, Any]] = []
        for item in items[:3]:
            if not isinstance(item, dict):
                continue

            preview_items.append(
                {
                    "external_id": _extract_field(item, config.source_id_field),
                    "title": _extract_field(item, config.title_field),
                    "slug": _extract_field(item, config.slug_field),
                    "content": _extract_field(item, config.content_field),
                    "excerpt": _extract_field(item, config.excerpt_field),
                    "published_at": _extract_field(item, config.published_at_field),
                    "modified_at": _extract_field(item, config.modified_at_field),
                    "featured_image": _extract_field(item, config.featured_image_field),
                    "status": _extract_field(item, config.status_field),
                    "categories": _extract_field(item, config.category_field),
                    "tags": _extract_field(item, config.tag_field),
                }
            )

        return {
            "success": True,
            "status_code": response.status_code,
            "item_count": len(items),
            "extracted_items_preview": preview_items,
            "raw_preview": data[:3] if isinstance(data, list) else data,
            "error_message": None,
        }