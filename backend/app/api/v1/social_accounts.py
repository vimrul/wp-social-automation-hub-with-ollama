from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.crypto import encrypt_value
from app.core.database import get_db
from app.models.social_account import SocialAccount
from app.schemas.social_account import (
    SocialAccountCreate,
    SocialAccountRead,
    SocialAccountUpdate,
    SocialAccountValidateResponse,
)
from app.services.logs.activity_logger import log_activity
from app.services.publishing.social_account_validation import validate_social_account

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

    log_activity(
        db,
        event_type="social_account_created",
        entity_type="social_account",
        entity_id=row.id,
        message=f"Social account '{row.name}' created.",
        details={"platform": row.platform},
    )

    return to_read_model(row)


@router.get("", response_model=list[SocialAccountRead])
def list_social_accounts(db: Session = Depends(get_db)):
    rows = db.query(SocialAccount).order_by(SocialAccount.id.desc()).all()
    return [to_read_model(row) for row in rows]


@router.put("/{social_account_id}", response_model=SocialAccountRead)
def update_social_account(
    social_account_id: int,
    payload: SocialAccountUpdate,
    db: Session = Depends(get_db),
):
    row = db.query(SocialAccount).filter(SocialAccount.id == social_account_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Social account not found")

    row.name = payload.name
    row.platform = payload.platform
    row.source_site_id = payload.source_site_id
    row.account_identifier = payload.account_identifier
    row.page_id = payload.page_id
    row.app_id = payload.app_id
    row.client_id = payload.client_id
    row.account_metadata_json = payload.account_metadata_json
    row.is_active = payload.is_active

    if payload.app_secret:
      row.app_secret_encrypted = encrypt_value(payload.app_secret)

    if payload.client_secret:
      row.client_secret_encrypted = encrypt_value(payload.client_secret)

    if payload.access_token:
      row.access_token_encrypted = encrypt_value(payload.access_token)

    if payload.refresh_token:
      row.refresh_token_encrypted = encrypt_value(payload.refresh_token)

    db.add(row)
    db.commit()
    db.refresh(row)

    log_activity(
        db,
        event_type="social_account_updated",
        entity_type="social_account",
        entity_id=row.id,
        message=f"Social account '{row.name}' updated.",
        details={"platform": row.platform},
    )

    return to_read_model(row)


@router.delete("/{social_account_id}")
def delete_social_account(social_account_id: int, db: Session = Depends(get_db)):
    row = db.query(SocialAccount).filter(SocialAccount.id == social_account_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Social account not found")

    row_name = row.name
    row_id = row.id

    db.delete(row)
    db.commit()

    log_activity(
        db,
        event_type="social_account_deleted",
        entity_type="social_account",
        entity_id=row_id,
        message=f"Social account '{row_name}' deleted.",
        details=None,
    )

    return {"success": True, "message": "Social account deleted successfully"}


@router.post("/{social_account_id}/validate", response_model=SocialAccountValidateResponse)
async def validate_social_account_route(
    social_account_id: int,
    db: Session = Depends(get_db),
):
    row = db.query(SocialAccount).filter(SocialAccount.id == social_account_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Social account not found")

    try:
        result = await validate_social_account(db, row)

        log_activity(
            db,
            event_type="social_account_validated",
            entity_type="social_account",
            entity_id=row.id,
            message=f"Social account '{row.name}' validated successfully.",
            details={"platform": row.platform},
        )

        return {
            "success": True,
            "platform": result["platform"],
            "social_account_id": row.id,
            "message": result["message"],
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_activity(
            db,
            event_type="social_account_validation_failed",
            entity_type="social_account",
            entity_id=row.id,
            message=f"Social account '{row.name}' validation failed.",
            details={"error": str(e), "platform": row.platform},
        )
        raise HTTPException(status_code=500, detail=str(e))