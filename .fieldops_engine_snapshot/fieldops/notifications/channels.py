CHANNELS = {"sms", "email", "push"}

def is_valid_channel(name: str) -> bool:
    return name in CHANNELS
