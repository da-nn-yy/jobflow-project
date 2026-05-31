"""Greedy route optimization stub."""
from __future__ import annotations

def optimize_route(stops: list[tuple[float, float]]) -> list[int]:
    if len(stops) <= 1:
        return list(range(len(stops)))
    return sorted(range(len(stops)), key=lambda i: stops[i][0] + stops[i][1])
