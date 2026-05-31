import re
_CRON = re.compile(r"^\S+ \S+ \S+ \S+ \S+$")

def validate_cron(expr: str) -> bool:
    return bool(_CRON.match(expr.strip()))
