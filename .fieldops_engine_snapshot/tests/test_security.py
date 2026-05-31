from fieldops.security.api_key import hash_key, verify_key

def test_api_key():
    h = hash_key('test-key')
    assert verify_key('test-key', h)
