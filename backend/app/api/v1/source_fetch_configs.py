from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.source_site import SourceSite
from app.models.source_fetch_config import SourceFetchConfig
from app.schemas.source_fetch_config import (
    FetchTestResponse,
    SourceFetchConfigCreate,
    SourceFetchConfigRead,
    SourceFetchConfigUpdate,
)
from app.services.logs.activity_logger import log_activity
from app.services.source.fetch_service import test_fetch_config

router = APIRouter(prefix="/source-fetch-configs", tags=["Source Fetch Configs"])


@router.post("", response_model=SourceFetchConfigRead)
def create_fetch_config(payload: SourceFetchConfigCreate, db: Session = Depends(get_db)):
    site = db.query(SourceSite).filter(SourceSite.id == payload.source_site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Source site not found")

    data = payload.model_dump()
    data["fetch_url"] = str(payload.fetch_url)

    config = SourceFetchConfig(**data)
    db.add(config)
    db.commit()
    db.refresh(config)

    log_activity(
        db,
        event_type="fetch_config_created",
        entity_type="source_fetch_config",
        entity_id=config.id,
        message=f"Fetch config '{config.fetch_name}' created.",
        details={"source_site_id": config.source_site_id, "fetch_url": config.fetch_url},
    )
    return config


@router.get("", response_model=list[SourceFetchConfigRead])
def list_fetch_configs(db: Session = Depends(get_db)):
    return db.query(SourceFetchConfig).order_by(SourceFetchConfig.id.desc()).all()


@router.get("/{config_id}", response_model=SourceFetchConfigRead)
def get_fetch_config(config_id: int, db: Session = Depends(get_db)):
    config = db.query(SourceFetchConfig).filter(SourceFetchConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Fetch config not found")
    return config


@router.put("/{config_id}", response_model=SourceFetchConfigRead)
def update_fetch_config(config_id: int, payload: SourceFetchConfigUpdate, db: Session = Depends(get_db)):
    config = db.query(SourceFetchConfig).filter(SourceFetchConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Fetch config not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "fetch_url" in update_data and update_data["fetch_url"] is not None:
        update_data["fetch_url"] = str(update_data["fetch_url"])

    for key, value in update_data.items():
        setattr(config, key, value)

    db.commit()
    db.refresh(config)

    log_activity(
        db,
        event_type="fetch_config_updated",
        entity_type="source_fetch_config",
        entity_id=config.id,
        message=f"Fetch config '{config.fetch_name}' updated.",
        details={"updated_fields": list(update_data.keys())},
    )
    return config


@router.delete("/{config_id}")
def delete_fetch_config(config_id: int, db: Session = Depends(get_db)):
    config = db.query(SourceFetchConfig).filter(SourceFetchConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Fetch config not found")

    fetch_name = config.fetch_name
    db.delete(config)
    db.commit()

    log_activity(
        db,
        event_type="fetch_config_deleted",
        entity_type="source_fetch_config",
        entity_id=config_id,
        message=f"Fetch config '{fetch_name}' deleted.",
    )
    return {"message": "Fetch config deleted successfully"}


@router.post("/{config_id}/test", response_model=FetchTestResponse)
async def run_test_fetch_config(config_id: int, db: Session = Depends(get_db)):
    config = db.query(SourceFetchConfig).filter(SourceFetchConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Fetch config not found")

    try:
        result = await test_fetch_config(config)

        log_activity(
            db,
            event_type="fetch_config_test_success",
            entity_type="source_fetch_config",
            entity_id=config.id,
            message=f"Fetch config '{config.fetch_name}' test succeeded.",
            details={"status_code": result["status_code"], "item_count": result["item_count"]},
        )
        return result

    except Exception as e:
        log_activity(
            db,
            event_type="fetch_config_test_failed",
            entity_type="source_fetch_config",
            entity_id=config.id,
            severity="error",
            message=f"Fetch config '{config.fetch_name}' test failed.",
            details={"error": str(e)},
        )
        return {
            "success": False,
            "status_code": 500,
            "item_count": 0,
            "extracted_items_preview": [],
            "raw_preview": None,
            "error_message": str(e),
        }