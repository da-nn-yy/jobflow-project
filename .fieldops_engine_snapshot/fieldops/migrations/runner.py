MIGRATIONS = ["001_init", "002_runs_index", "003_webhooks"]

def pending(applied: list[str]) -> list[str]:
    return [m for m in MIGRATIONS if m not in applied]
