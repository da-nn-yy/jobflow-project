from datetime import datetime, timezone

class SystemClock:
    def now_iso(self) -> str:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
