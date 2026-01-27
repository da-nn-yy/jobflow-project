import { describe, expect, it } from "vitest";
import { MetricsRegistry } from "../src/metrics/registry.js";
import { formatPrometheus } from "../src/metrics/prometheus.js";

describe("MetricsRegistry", () => {
  it("exports prometheus format", () => {
    const reg = new MetricsRegistry();
    reg.increment("runs_total", { status: "ok" });
    reg.observe("task_duration_ms", 42, { handler: "invoice.fetch" });
    const body = formatPrometheus(reg);
    expect(body).toContain("runs_total");
    expect(body).toContain("task_duration_ms");
  });
});
