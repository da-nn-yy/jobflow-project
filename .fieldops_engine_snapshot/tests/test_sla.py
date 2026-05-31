from datetime import datetime, timedelta
from fieldops.sla.policy import is_breached

def test_sla_breach():
    start = datetime(2026,1,1,12,0)
    assert is_breached(start, start + timedelta(minutes=61), 60)
