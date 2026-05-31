from fieldops.migrations.runner import pending

def test_pending():
    assert pending(['001_init']) == ['002_runs_index', '003_webhooks']
