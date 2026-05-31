"""Territory lookup helpers."""
from __future__ import annotations

TERRITORIES = {"north": ["ZIP-100", "ZIP-101"], "south": ["ZIP-200", "ZIP-201"]}

def territory_for_zip(zip_code: str) -> str | None:
    for name, zips in TERRITORIES.items():
        if zip_code in zips:
            return name
    return None
