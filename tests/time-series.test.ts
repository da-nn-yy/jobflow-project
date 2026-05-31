import { describe, expect, it } from "vitest";
import { TimeSeriesBuffer } from "../src/analytics/time-series.js";

describe("TimeSeriesBuffer", () => {
  it("records and retrieves points", () => {
    const buf = new TimeSeriesBuffer(100);
    buf.record("latency", 42, "2026-01-01T00:00:00.000Z");
    buf.record("latency", 50, "2026-01-02T00:00:00.000Z");
    const series = buf.get("latency");
    expect(series.points).toHaveLength(2);
    expect(series.points[0].value).toBe(42);
  });

  it("filters by since timestamp", () => {
    const buf = new TimeSeriesBuffer();
    buf.record("x", 1, "2026-01-01T00:00:00.000Z");
    buf.record("x", 2, "2026-01-10T00:00:00.000Z");
    const filtered = buf.get("x", "2026-01-05T00:00:00.000Z");
    expect(filtered.points).toHaveLength(1);
    expect(filtered.points[0].value).toBe(2);
  });

  it("rolls up into time buckets", () => {
    const buf = new TimeSeriesBuffer();
    const t0 = new Date("2026-01-01T12:00:00.000Z").getTime();
    buf.record("cpu", 10, new Date(t0).toISOString());
    buf.record("cpu", 30, new Date(t0 + 1000).toISOString());
    const rolled = buf.rollup("cpu", 60_000);
    expect(rolled.points.length).toBeGreaterThanOrEqual(1);
    expect(rolled.points[0].value).toBe(20);
  });

  it("evicts oldest when max points exceeded", () => {
    const buf = new TimeSeriesBuffer(2);
    buf.record("m", 1);
    buf.record("m", 2);
    buf.record("m", 3);
    expect(buf.get("m").points).toHaveLength(2);
    expect(buf.get("m").points[0].value).toBe(2);
  });
});
