def backoff_ms(attempt: int, base: int = 500, cap: int = 30000) -> int:
    return min(base * (2 ** max(attempt - 1, 0)), cap)
