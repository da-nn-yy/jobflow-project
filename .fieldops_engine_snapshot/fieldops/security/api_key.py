import hashlib

def hash_key(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()

def verify_key(raw: str, stored_hash: str) -> bool:
    return hash_key(raw) == stored_hash
