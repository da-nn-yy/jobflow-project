import type { CounterMetric, HistogramMetric } from "./types.js";

export class MetricsRegistry {
  private counters = new Map<string, number>();
  private histograms = new Map<string, { sum: number; count: number; buckets: number[] }>();

  increment(name: string, labels: Record<string, string> = {}, delta = 1): void {
    const key = this.key(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + delta);
  }

  observe(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.key(name, labels);
    const cur = this.histograms.get(key) ?? { sum: 0, count: 0, buckets: [0, 0, 0, 0, 0] };
    cur.sum += value;
    cur.count += 1;
    const bounds = [10, 50, 100, 500, 1000];
    bounds.forEach((b, i) => {
      if (value <= b) cur.buckets[i] += 1;
    });
    this.histograms.set(key, cur);
  }

  snapshot(): { counters: CounterMetric[]; histograms: HistogramMetric[] } {
    const counters: CounterMetric[] = [];
    for (const [key, value] of this.counters) {
      const { name, labels } = this.parseKey(key);
      counters.push({ name, labels, value });
    }
    const histograms: HistogramMetric[] = [];
    for (const [key, h] of this.histograms) {
      const { name, labels } = this.parseKey(key);
      const bounds = [10, 50, 100, 500, 1000];
      histograms.push({
        name,
        labels,
        sum: h.sum,
        count: h.count,
        buckets: bounds.map((le, i) => ({ le, count: h.buckets[i] })),
      });
    }
    return { counters, histograms };
  }

  private key(name: string, labels: Record<string, string>): string {
    const parts = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`);
    return `${name}|${parts.join(",")}`;
  }

  private parseKey(key: string): { name: string; labels: Record<string, string> } {
    const [name, labelStr] = key.split("|");
    const labels: Record<string, string> = {};
    if (labelStr) {
      for (const part of labelStr.split(",")) {
        const [k, v] = part.split("=");
        if (k && v) labels[k] = v;
      }
    }
    return { name: name ?? key, labels };
  }
}
