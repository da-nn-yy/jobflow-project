"""SLA breach evaluation."""
from __future__ import annotations
from datetime import datetime, timedelta

def is_breached(started: datetime, now: datetime, limit_minutes: int) -> bool:
    return now - started > timedelta(minutes=limit_minutes)
