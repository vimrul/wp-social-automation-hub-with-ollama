import urllib.parse
from datetime import datetime
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.config import settings
from app.core.crypto import encrypt_value
from app.core.database import get_db
from app.models.oauth_state import OAuthState
from app.models.social_account import SocialAccount
from app.models.user import User
from app.schemas.oauth import OAuthConnectResponse
from app.services.logs.activity_logger import log_activity
from app.services.oauth.oauth_utils import (
    generate_code_challenge,
    generate_code_verifier,
    generate_state,
)

router = APIRouter(prefix="/oauth", tags=["OAuth"])


@router.get("/x/connect", response_model=OAuthConnectResponse)
def connect_x(
    redirect_after: str = Query("/social-accounts"),
    source_site_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles("admin", "superadmin")),
):
    state = generate_state()
    code_verifier = generate_code_verifier()
    code_challenge = generate_code_challenge(code_verifier)

    db.add(
        OAuthState(
            provider="x",
            state=state,
            code_verifier=code_verifier,
            redirect_after=redirect_after,
            source_site_id=source_site_id,
        )
    )
    db.commit()

    params = {
        "response_type": "code",
        "client_id": settings.X_CLIENT_ID,
        "redirect_uri": settings.X_CALLBACK_URL,
        "scope": settings.X_SCOPES,
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    }

    authorization_url = "https://x.com/i/oauth2/authorize?" + urllib.parse.urlencode(params)

    return {"authorization_url": authorization_url}


@router.get("/x/callback")
async def callback_x(
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db),
):
    oauth_state = (
        db.query(OAuthState)
        .filter(OAuthState.state == state, OAuthState.provider == "x")
        .first()
    )
    if not oauth_state:
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state")

    data = {
        "code": code,
        "grant_type": "authorization_code",
        "client_id": settings.X_CLIENT_ID,
        "redirect_uri": settings.X_CALLBACK_URL,
        "code_verifier": oauth_state.code_verifier,
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        token_response = await client.post(
            "https://api.x.com/2/oauth2/token",
            data=data,
            headers=headers,
            auth=(settings.X_CLIENT_ID, settings.X_CLIENT_SECRET),
        )
        token_response.raise_for_status()
        token_json = token_response.json()

        access_token = token_json.get("access_token")
        refresh_token = token_json.get("refresh_token")

        me_response = await client.get(
            "https://api.x.com/2/users/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        me_response.raise_for_status()
        me_json = me_response.json()

    user_data = me_json.get("data", {})
    account_identifier = str(user_data.get("id")) if user_data.get("id") else None
    username = user_data.get("username") or "x-account"

    row = SocialAccount(
        name=f"X - {username}",
        platform="twitter",
        source_site_id=oauth_state.source_site_id,
        account_identifier=account_identifier,
        client_id=settings.X_CLIENT_ID,
        client_secret_encrypted=encrypt_value(settings.X_CLIENT_SECRET),
        access_token_encrypted=encrypt_value(access_token),
        refresh_token_encrypted=encrypt_value(refresh_token) if refresh_token else None,
        account_metadata_json=str(token_json),
        is_active=True,
        last_validated_at=datetime.utcnow(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    log_activity(
        db,
        event_type="social_account_connected",
        entity_type="social_account",
        entity_id=row.id,
        message=f"X account '{row.name}' connected via OAuth.",
        details={"platform": "twitter", "account_identifier": account_identifier},
    )

    redirect_url = (
        f"{settings.FRONTEND_BASE_URL}"
        f"{oauth_state.redirect_after}?oauth_success=1&provider=x"
    )

    db.delete(oauth_state)
    db.commit()

    return {
        "success": True,
        "provider": "x",
        "social_account_id": row.id,
        "message": "X account connected successfully",
        "redirect_url": redirect_url,
    }


@router.get("/facebook/connect", response_model=OAuthConnectResponse)
def connect_facebook(
    redirect_after: str = Query("/social-accounts"),
    source_site_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles("admin", "superadmin")),
):
    state = generate_state()

    db.add(
        OAuthState(
            provider="facebook",
            state=state,
            redirect_after=redirect_after,
            source_site_id=source_site_id,
        )
    )
    db.commit()

    params = {
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "redirect_uri": settings.FACEBOOK_CALLBACK_URL,
        "state": state,
        "scope": settings.FACEBOOK_SCOPES,
        "response_type": "code",
    }

    authorization_url = (
        "https://www.facebook.com/v23.0/dialog/oauth?"
        + urllib.parse.urlencode(params)
    )

    return {"authorization_url": authorization_url}


@router.get("/facebook/callback")
async def callback_facebook(
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db),
):
    oauth_state = (
        db.query(OAuthState)
        .filter(
            OAuthState.state == state,
            OAuthState.provider == "facebook",
        )
        .first()
    )
    if not oauth_state:
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state")

    async with httpx.AsyncClient(timeout=30.0) as client:
        token_response = await client.get(
            "https://graph.facebook.com/v23.0/oauth/access_token",
            params={
                "client_id": settings.FACEBOOK_CLIENT_ID,
                "client_secret": settings.FACEBOOK_CLIENT_SECRET,
                "redirect_uri": settings.FACEBOOK_CALLBACK_URL,
                "code": code,
            },
        )
        token_response.raise_for_status()
        token_json = token_response.json()

        access_token = token_json.get("access_token")

        me_response = await client.get(
            "https://graph.facebook.com/v23.0/me",
            params={
                "fields": "id,name",
                "access_token": access_token,
            },
        )
        me_response.raise_for_status()
        me_json = me_response.json()

    account_identifier = str(me_json.get("id")) if me_json.get("id") else None
    name = me_json.get("name") or "facebook-account"

    row = SocialAccount(
        name=f"Facebook - {name}",
        platform="facebook",
        source_site_id=oauth_state.source_site_id,
        account_identifier=account_identifier,
        app_id=settings.FACEBOOK_CLIENT_ID,
        app_secret_encrypted=encrypt_value(settings.FACEBOOK_CLIENT_SECRET),
        access_token_encrypted=encrypt_value(access_token),
        account_metadata_json=str(token_json),
        is_active=True,
        last_validated_at=datetime.utcnow(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    log_activity(
        db,
        event_type="social_account_connected",
        entity_type="social_account",
        entity_id=row.id,
        message=f"Facebook account '{row.name}' connected via OAuth.",
        details={"platform": "facebook", "account_identifier": account_identifier},
    )

    redirect_url = (
        f"{settings.FRONTEND_BASE_URL}"
        f"{oauth_state.redirect_after}?oauth_success=1&provider=facebook"
    )

    db.delete(oauth_state)
    db.commit()

    return {
        "success": True,
        "provider": "facebook",
        "social_account_id": row.id,
        "message": "Facebook account connected successfully",
        "redirect_url": redirect_url,
    }