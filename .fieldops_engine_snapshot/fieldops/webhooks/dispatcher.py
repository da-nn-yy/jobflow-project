from fieldops.webhooks.signer import sign

class WebhookDispatcher:
    def __init__(self, secret: str) -> None:
        self.secret = secret
        self.attempts = 0

    def dispatch(self, url: str, body: bytes) -> dict[str, str]:
        self.attempts += 1
        return {"url": url, "signature": sign(body, self.secret), "attempt": str(self.attempts)}
