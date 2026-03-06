import json
import time
from typing import Any, Dict, Optional

import httpx

from app.models.ollama_profile import OllamaProfile


def _safe_json_loads(value: Optional[str], default):
    if not value:
        return default
    try:
        return json.loads(value)
    except Exception:
        return default


async def call_ollama(profile: OllamaProfile, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
    headers = _safe_json_loads(profile.custom_headers_json, {})
    auth = None

    if profile.auth_type == "bearer" and profile.auth_token_encrypted:
        headers["Authorization"] = f"Bearer {profile.auth_token_encrypted}"
    elif profile.auth_type == "basic" and profile.auth_username and profile.auth_password_encrypted:
        auth = (profile.auth_username, profile.auth_password_encrypted)

    payload = {
        "model": profile.model_name,
        "prompt": prompt,
        "stream": False,
    }

    if system_prompt:
        payload["system"] = system_prompt

    start_time = time.time()

    async with httpx.AsyncClient(timeout=float(profile.timeout_seconds), follow_redirects=True) as client:
        response = await client.post(
            f"{profile.base_url.rstrip('/')}/api/generate",
            json=payload,
            headers=headers,
            auth=auth,
        )
        response.raise_for_status()
        data = response.json()

    duration_ms = int((time.time() - start_time) * 1000)

    return {
        "request_payload": payload,
        "response_payload": data,
        "output_text": data.get("response", "").strip(),
        "duration_ms": duration_ms,
    }
