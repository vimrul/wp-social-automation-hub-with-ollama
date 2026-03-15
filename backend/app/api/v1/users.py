from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserProfileUpdate, UserRead

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles("superadmin", "admin")),
):
    rows = db.query(User).order_by(User.id.desc()).all()
    return [UserRead.model_validate(row) for row in rows]


@router.post("", response_model=UserRead)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles("superadmin")),
):
    existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    row = User(
        full_name=payload.full_name,
        email=payload.email.lower().strip(),
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        phone=payload.phone,
        photo_url=payload.photo_url,
        git_url=payload.git_url,
        linkedin_url=payload.linkedin_url,
        x_url=payload.x_url,
        facebook_url=payload.facebook_url,
        is_active=payload.is_active,
        is_superuser=payload.is_superuser,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return UserRead.model_validate(row)


@router.get("/me", response_model=UserRead)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return UserRead.model_validate(current_user)


@router.put("/me", response_model=UserRead)
def update_my_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.full_name = payload.full_name
    current_user.phone = payload.phone
    current_user.photo_url = payload.photo_url
    current_user.git_url = payload.git_url
    current_user.linkedin_url = payload.linkedin_url
    current_user.x_url = payload.x_url
    current_user.facebook_url = payload.facebook_url

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return UserRead.model_validate(current_user)