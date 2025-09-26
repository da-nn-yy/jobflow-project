import type { MetricsRegistry } from "./registry.js";

export function formatPrometheus(registry: MetricsRegistry): string {
  const { counters, histograms } = registry.snapshot();
  const lines: string[] = [];

  for (const c of counters) {
    const labelStr = formatLabels(c.labels);
    lines.push(`# TYPE ${c.name} counter`);
    lines.push(`${c.name}${labelStr} ${c.value}`);
  }

  for (const h of histograms) {
    const base = h.name;
    const labelStr = formatLabels(h.labels);
    let cumulative = 0;
    for (const b of h.buckets) {
      cumulative += b.count;
      const bucketLabels = { ...h.labels, le: String(b.le) };
      lines.push(`${base}_bucket${formatLabels(bucketLabels)} ${cumulative}`);
    }
    lines.push(`${base}_sum${labelStr} ${h.sum}`);
    lines.push(`${base}_count${labelStr} ${h.count}`);
  }

  return lines.join("\n") + "\n";
}

function formatLabels(labels: Record<string, string>): string {
  const entries = Object.entries(labels);
  if (!entries.length) return "";
  const inner = entries.map(([k, v]) => `${k}="${escapeLabel(v)}"`).join(",");
  return `{${inner}}`;
}

function escapeLabel(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
