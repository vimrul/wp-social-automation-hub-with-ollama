from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.source_site import SourceSite
from app.schemas.source_site import SourceSiteCreate, SourceSiteRead, SourceSiteUpdate
from app.services.logs.activity_logger import log_activity

router = APIRouter(prefix="/source-sites", tags=["Source Sites"])


@router.post("", response_model=SourceSiteRead)
def create_source_site(payload: SourceSiteCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["base_url"] = str(payload.base_url)

    source_site = SourceSite(**data)
    db.add(source_site)
    db.commit()
    db.refresh(source_site)

    log_activity(
        db,
        event_type="source_site_created",
        entity_type="source_site",
        entity_id=source_site.id,
        message=f"Source site '{source_site.name}' created.",
        details={"base_url": source_site.base_url, "site_type": source_site.site_type},
    )
    return source_site


@router.get("", response_model=list[SourceSiteRead])
def list_source_sites(db: Session = Depends(get_db)):
    return db.query(SourceSite).order_by(SourceSite.id.desc()).all()


@router.get("/{site_id}", response_model=SourceSiteRead)
def get_source_site(site_id: int, db: Session = Depends(get_db)):
    site = db.query(SourceSite).filter(SourceSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Source site not found")
    return site


@router.put("/{site_id}", response_model=SourceSiteRead)
def update_source_site(site_id: int, payload: SourceSiteUpdate, db: Session = Depends(get_db)):
    site = db.query(SourceSite).filter(SourceSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Source site not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "base_url" in update_data and update_data["base_url"] is not None:
        update_data["base_url"] = str(update_data["base_url"])

    for key, value in update_data.items():
        setattr(site, key, value)

    db.commit()
    db.refresh(site)

    log_activity(
        db,
        event_type="source_site_updated",
        entity_type="source_site",
        entity_id=site.id,
        message=f"Source site '{site.name}' updated.",
        details={"updated_fields": list(update_data.keys())},
    )
    return site


@router.delete("/{site_id}")
def delete_source_site(site_id: int, db: Session = Depends(get_db)):
    site = db.query(SourceSite).filter(SourceSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Source site not found")

    site_name = site.name
    db.delete(site)
    db.commit()

    log_activity(
        db,
        event_type="source_site_deleted",
        entity_type="source_site",
        entity_id=site_id,
        message=f"Source site '{site_name}' deleted.",
    )
    return {"message": "Source site deleted successfully"}
