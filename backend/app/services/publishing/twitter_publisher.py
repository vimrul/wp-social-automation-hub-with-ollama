import httpx


async def publish_to_twitter(*, bearer_token: str, text: str) -> dict:
    url = "https://api.twitter.com/2/tweets"

    headers = {
        "Authorization": f"Bearer {bearer_token}",
        "Content-Type": "application/json",
    }

    payload = {
        "text": text,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

    tweet_id = data.get("data", {}).get("id")
    published_url = f"https://twitter.com/i/web/status/{tweet_id}" if tweet_id else None

    return {
        "published_id": tweet_id,
        "published_url": published_url,
        "raw_response": data,
    }
