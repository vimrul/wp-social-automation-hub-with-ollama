import hashlib


def generate_content_hash(*values: str) -> str:
    raw = "||".join(values)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
