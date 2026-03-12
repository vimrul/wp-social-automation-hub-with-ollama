import httpx


async def publish_to_facebook_page(*, page_id: str, access_token: str, message: str) -> dict:
    url = f"https://graph.facebook.com/v23.0/{page_id}/feed"

    payload = {
        "message": message,
        "access_token": access_token,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, data=payload)
        response.raise_for_status()
        data = response.json()

    published_id = data.get("id")
    published_url = f"https://www.facebook.com/{published_id}" if published_id else None

    return {
        "published_id": published_id,
        "published_url": published_url,
        "raw_response": data,
    }
