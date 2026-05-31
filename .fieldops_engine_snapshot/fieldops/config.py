from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
import yaml
from pathlib import Path

class LatencyRange(BaseModel):
    min: int = 5
    max: int = 60

class Settings(BaseModel):
    port: int = 4200
    log_level: str = "info"
    worker_concurrency: int = 4
    default_task_timeout_ms: int = 30_000
    simulate_latency_ms: LatencyRange = Field(default_factory=LatencyRange)
    fail_rate_percent: float = 0

def load_settings(path: str | None = None) -> Settings:
    if not path:
        return Settings()
    raw = yaml.safe_load(Path(path).read_text(encoding="utf-8"))
    return Settings.model_validate(raw)
