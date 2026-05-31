from datetime import datetime, timedelta

def should_purge(created: datetime, now: datetime, days: int) -> bool:
    return now - created > timedelta(days=days)
