from fieldops.reporting.dashboard import build_summary

def test_dashboard():
    assert build_summary(10, 8, 2)['success_rate'] == 0.8
