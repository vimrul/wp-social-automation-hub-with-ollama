from typing import Optional

from cryptography.fernet import Fernet
from app.core.config import settings

fernet = Fernet(settings.FIELD_ENCRYPTION_KEY.encode())


def encrypt_value(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    return fernet.encrypt(value.encode()).decode()


def decrypt_value(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    return fernet.decrypt(value.encode()).decode()
