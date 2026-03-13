from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User


def run():
    db = SessionLocal()
    try:
        email = "admin@example.com"

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print("Superadmin already exists")
            return

        user = User(
            full_name="Super Admin",
            email=email,
            password_hash=get_password_hash("Admin123!"),
            role="superadmin",
            is_active=True,
            is_superuser=True,
        )
        db.add(user)
        db.commit()
        print("Superadmin created")
        print("email:", email)
        print("password: Admin123!")
    finally:
        db.close()


if __name__ == "__main__":
    run()
