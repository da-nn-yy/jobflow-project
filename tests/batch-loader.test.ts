import { describe, expect, it } from "vitest";
import { loadBatchManifest } from "../src/batch/loader.js";
import path from "node:path";

describe("loadBatchManifest", () => {
  it("loads finance daily batch config", async () => {
    const manifestPath = path.join("config", "batch", "finance-daily.json");
    const manifest = await loadBatchManifest(manifestPath);
    expect(manifest.id).toBe("finance_daily_batch");
    expect(manifest.items).toHaveLength(2);
    expect(manifest.items[0].jobId).toBe("invoice_sync");
    expect(manifest.maxParallel).toBe(3);
  });
});
