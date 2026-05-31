export interface TimeSeriesPoint {
  ts: string;
  value: number;
}

export interface TimeSeries {
  name: string;
  points: TimeSeriesPoint[];
}

export class TimeSeriesBuffer {
  private readonly data = new Map<string, TimeSeriesPoint[]>();
  private readonly maxPoints: number;

  constructor(maxPoints = 10_000) {
    this.maxPoints = maxPoints;
  }

  record(name: string, value: number, ts = new Date().toISOString()): void {
    const list = this.data.get(name) ?? [];
    list.push({ ts, value });
    if (list.length > this.maxPoints) list.shift();
    this.data.set(name, list);
  }

  get(name: string, since?: string): TimeSeries {
    let points = this.data.get(name) ?? [];
    if (since) points = points.filter((p) => p.ts >= since);
    return { name, points };
  }

  rollup(name: string, bucketMs: number): TimeSeries {
    const points = this.data.get(name) ?? [];
    const buckets = new Map<number, { sum: number; count: number }>();
    for (const p of points) {
      const key = Math.floor(new Date(p.ts).getTime() / bucketMs) * bucketMs;
      const b = buckets.get(key) ?? { sum: 0, count: 0 };
      b.sum += p.value;
      b.count += 1;
      buckets.set(key, b);
    }
    const rolled: TimeSeriesPoint[] = [...buckets.entries()]
      .sort(([a], [b]) => a - b)
      .map(([k, v]) => ({ ts: new Date(k).toISOString(), value: v.sum / v.count }));
    return { name: `${name}_rollup`, points: rolled };
  }
}
