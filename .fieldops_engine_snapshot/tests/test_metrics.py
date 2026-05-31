from fieldops.metrics.registry import MetricsRegistry

def test_metrics():
    m = MetricsRegistry()
    m.inc('runs_total', 2)
    assert 'runs_total 2' in m.render()
