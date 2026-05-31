from fieldops.openapi.spec import service_info

def test_service_info():
    assert service_info()['title'] == 'FieldOps Engine'
