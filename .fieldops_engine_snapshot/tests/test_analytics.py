from fieldops.analytics.run_metrics import success_rate
from fieldops.analytics.time_series import bucket_by_hour
from datetime import datetime

def test_success_rate_empty():
    assert success_rate([]) == 0.0

def test_bucket_by_hour():
    ts = [datetime(2026,1,1,10,0), datetime(2026,1,1,10,30)]
    assert bucket_by_hour(ts)['2026-01-01T10'] == 2
