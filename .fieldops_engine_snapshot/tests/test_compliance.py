from datetime import datetime, timedelta
from fieldops.compliance.retention import should_purge

def test_retention():
    created = datetime(2025,1,1)
    assert should_purge(created, created + timedelta(days=400), 365)
