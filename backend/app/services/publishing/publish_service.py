from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.models.ai_generation import AIGeneration
from app.models.post import Post
from app.models.social_account import SocialAccount
from app.services.publishing.facebook_publisher import publish_to_facebook_page
from app.services.publishing.twitter_publisher import publish_to_twitter


def _build_publish_text(*, base_text: Optional[str], hashtags: Optional[str]) -> str:
    text = (base_text or "").strip()
    tag_text = (hashtags or "").strip()

    if text and tag_text:
        return f"{text}\n\n{tag_text}"
    if text:
        return text
    return tag_text


def _extract_latest_generated_content(
    db: Session, post_id: int, platform: str
) -> Tuple[Optional[str], Optional[str]]:
    generation_type_map = {
        "facebook": "facebook_summary",
        "twitter": "twitter_summary",
        "x": "twitter_summary",
    }

    generation_type = generation_type_map.get(platform)

    text_value = None
    hashtag_value = None

    if generation_type:
        latest_text = (
            db.query(AIGeneration)
            .filter(
                AIGeneration.post_id == post_id,
                AIGeneration.generation_type == generation_type,
            )
            .order_by(AIGeneration.id.desc())
            .first()
        )
        if latest_text:
            text_value = latest_text.output_text

    latest_hashtags = (
        db.query(AIGeneration)
        .filter(
            AIGeneration.post_id == post_id,
            AIGeneration.generation_type == "hashtags",
        )
        .order_by(AIGeneration.id.desc())
        .first()
    )
    if latest_hashtags:
        hashtag_value = latest_hashtags.output_text or getattr(latest_hashtags, "hashtags", None)

    return text_value, hashtag_value


async def publish_post_to_social_account(
    *,
    db: Session,
    post_id: int,
    social_account_id: int,
    content_text: Optional[str] = None,
    hashtags: Optional[str] = None,
) -> dict:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise ValueError("Post not found")

    social_account = db.query(SocialAccount).filter(SocialAccount.id == social_account_id).first()
    if not social_account:
        raise ValueError("Social account not found")

    if not social_account.is_active:
        raise ValueError("Social account is inactive")

    generated_text, generated_hashtags = _extract_latest_generated_content(
        db, post_id=post_id, platform=social_account.platform
    )

    final_base_text = content_text or generated_text
    final_hashtags = hashtags or generated_hashtags

    final_text = _build_publish_text(
        base_text=final_base_text,
        hashtags=final_hashtags,
    )

    if not final_text.strip():
        raise ValueError("No content available to publish")

    platform = (social_account.platform or "").lower()

    if platform == "facebook":
        if not social_account.page_id:
            raise ValueError("Facebook page_id is missing")
        if not social_account.access_token_encrypted:
            raise ValueError("Facebook access token is missing")

        result = await publish_to_facebook_page(
            page_id=social_account.page_id,
            access_token=social_account.access_token_encrypted,
            message=final_text,
        )
        return {
            "platform": platform,
            "text_used": final_base_text,
            "hashtags_used": final_hashtags,
            "full_text_used": final_text,
            **result,
        }

    if platform in {"twitter", "x"}:
        if not social_account.access_token_encrypted:
            raise ValueError("Twitter/X access token is missing")

        result = await publish_to_twitter(
            bearer_token=social_account.access_token_encrypted,
            text=final_text,
        )
        return {
            "platform": platform,
            "text_used": final_base_text,
            "hashtags_used": final_hashtags,
            "full_text_used": final_text,
            **result,
        }

    raise ValueError(f"Unsupported platform: {social_account.platform}")