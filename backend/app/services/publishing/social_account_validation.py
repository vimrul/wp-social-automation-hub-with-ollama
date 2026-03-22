from datetime import datetime

import httpx
from sqlalchemy.orm import Session

from app.core.crypto import decrypt_value
from app.models.social_account import SocialAccount


async def validate_social_account(db: Session, social_account: SocialAccount) -> dict:
    platform = (social_account.platform or "").lower()

    if not social_account.is_active:
        raise ValueError("Social account is inactive")

    if platform == "facebook":
        if not social_account.access_token_encrypted:
            raise ValueError("Facebook access token is missing")

        access_token = decrypt_value(social_account.access_token_encrypted)

        url = "https://graph.facebook.com/v23.0/me"
        params = {"access_token": access_token}

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()

        social_account.last_validated_at = datetime.utcnow()
        db.add(social_account)
        db.commit()

        return {
            "success": True,
            "platform": platform,
            "message": "Facebook token validated successfully",
        }

    if platform in {"twitter", "x"}:
        if not social_account.access_token_encrypted:
            raise ValueError("Twitter/X access token is missing")

        access_token = decrypt_value(social_account.access_token_encrypted)

        url = "https://api.x.com/2/users/me"
        headers = {
            "Authorization": f"Bearer {access_token}",
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()

        social_account.last_validated_at = datetime.utcnow()
        db.add(social_account)
        db.commit()

        return {
            "success": True,
            "platform": platform,
            "message": "Twitter/X token validated successfully",
        }

    raise ValueError(f"Unsupported platform: {social_account.platform}")