from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.crypto import encrypt_value
from app.core.database import get_db
from app.models.social_account import SocialAccount
from app.schemas.social_account import SocialAccountCreate, SocialAccountRead

router = APIRouter(prefix="/social-accounts", tags=["Social Accounts"])


def to_read_model(row: SocialAccount) -> dict:
    return {
        "id": row.id,
        "name": row.name,
        "platform": row.platform,
        "source_site_id": row.source_site_id,
        "account_identifier": row.account_identifier,
        "page_id": row.page_id,
        "app_id": row.app_id,
        "client_id": row.client_id,
        "account_metadata_json": row.account_metadata_json,
        "is_active": row.is_active,
        "last_validated_at": row.last_validated_at,
        "created_at": row.created_at,
        "updated_at": row.updated_at,
        "app_secret_configured": bool(row.app_secret_encrypted),
        "client_secret_configured": bool(row.client_secret_encrypted),
        "access_token_configured": bool(row.access_token_encrypted),
        "refresh_token_configured": bool(row.refresh_token_encrypted),
    }


@router.post("", response_model=SocialAccountRead)
def create_social_account(payload: SocialAccountCreate, db: Session = Depends(get_db)):
    row = SocialAccount(
        name=payload.name,
        platform=payload.platform,
        source_site_id=payload.source_site_id,
        account_identifier=payload.account_identifier,
        page_id=payload.page_id,
        app_id=payload.app_id,
        app_secret_encrypted=encrypt_value(payload.app_secret),
        client_id=payload.client_id,
        client_secret_encrypted=encrypt_value(payload.client_secret),
        access_token_encrypted=encrypt_value(payload.access_token),
        refresh_token_encrypted=encrypt_value(payload.refresh_token),
        account_metadata_json=payload.account_metadata_json,
        is_active=payload.is_active,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return to_read_model(row)


@router.get("", response_model=list[SocialAccountRead])
def list_social_accounts(db: Session = Depends(get_db)):
    rows = db.query(SocialAccount).order_by(SocialAccount.id.desc()).all()
    return [to_read_model(row) for row in rows]
