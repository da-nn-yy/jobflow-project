"""Time-bucketed run counts."""
from __future__ import annotations
from collections import defaultdict
from datetime import datetime

def bucket_by_hour(timestamps: list[datetime]) -> dict[str, int]:
    out: dict[str, int] = defaultdict(int)
    for ts in timestamps:
        out[ts.strftime("%Y-%m-%dT%H")] += 1
    return dict(sorted(out.items()))
