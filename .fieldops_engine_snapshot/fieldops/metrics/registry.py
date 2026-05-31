"""Prometheus-style metrics registry."""
from __future__ import annotations
from collections import defaultdict

class MetricsRegistry:
    def __init__(self) -> None:
        self.counters: dict[str, float] = defaultdict(float)

    def inc(self, name: str, value: float = 1.0) -> None:
        self.counters[name] += value

    def render(self) -> str:
        lines = []
        for name, value in sorted(self.counters.items()):
            lines.append(f"# TYPE {name} counter")
            lines.append(f"{name} {value}")
        return "\n".join(lines) + "\n"
