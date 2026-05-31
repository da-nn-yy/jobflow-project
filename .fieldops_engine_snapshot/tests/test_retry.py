from fieldops.retry.policy import backoff_ms

def test_backoff():
    assert backoff_ms(1) == 500
    assert backoff_ms(3) == 2000
