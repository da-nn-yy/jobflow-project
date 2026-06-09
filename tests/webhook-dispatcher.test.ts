import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { WebhookDispatcher } from "../src/webhooks/dispatcher.js";
import { SystemClock } from "../src/utils/clock.js";
import { createLogger } from "../src/utils/logger.js";

describe("WebhookDispatcher", () => {
  const log = createLogger({ logLevel: "warn" });
  const clock = new SystemClock();

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("marks delivery delivered when endpoint responds ok", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);
    const dispatcher = new WebhookDispatcher(log, clock, 2);
    const endpoint = {
      id: "ep1" as const,
      tenantId: "tenant_dev" as const,
      url: "https://example.com/hook",
      secret: "s",
      events: ["run.completed" as const],
      enabled: true,
      createdAt: "2026-01-01T00:00:00Z",
    };
    const result = await dispatcher.dispatch(endpoint, "run.completed", { runId: "r1" });
    expect(result.ok).toBe(true);
    expect(result.delivery.status).toBe("delivered");
    expect(result.delivery.attempts).toBe(1);
  });

  it("retries and fails after max attempts", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network"));
    const dispatcher = new WebhookDispatcher(log, clock, 2);
    const endpoint = {
      id: "ep2" as const,
      tenantId: "tenant_dev" as const,
      url: "https://example.com/hook",
      secret: "s",
      events: ["run.failed" as const],
      enabled: true,
      createdAt: "2026-01-01T00:00:00Z",
    };
    const result = await dispatcher.dispatch(endpoint, "run.failed", { runId: "r2" });
    expect(result.ok).toBe(false);
    expect(result.delivery.status).toBe("failed");
    expect(result.delivery.attempts).toBe(2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
