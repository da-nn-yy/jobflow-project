from fieldops.webhooks.signer import sign
from fieldops.webhooks.dispatcher import WebhookDispatcher

def test_sign_and_dispatch():
    body = b'payload'
    assert len(sign(body,'secret')) == 64
    d = WebhookDispatcher('secret')
    assert d.dispatch('https://ex.com', body)['attempt'] == '1'
