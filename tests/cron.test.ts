import { describe, expect, it } from "vitest";
import { matchesCron, nextCronRun } from "../src/utils/cron.js";

describe("cron utils", () => {
  it("matches every 5 minutes", () => {
    const d = new Date("2026-03-01T12:05:00.000Z");
    expect(matchesCron("*/5 * * * *", d)).toBe(true);
  });

  it("computes next run", () => {
    const after = new Date("2026-03-01T12:00:00.000Z");
    const next = nextCronRun("*/15 * * * *", after);
    expect(next.getTime()).toBeGreaterThan(after.getTime());
  });
});
