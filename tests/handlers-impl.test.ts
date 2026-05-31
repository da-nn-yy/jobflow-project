import { describe, expect, it } from "vitest";
import { HandlerImplementationRegistry } from "../src/handlers/implementations/registry.js";
import { InvoiceFetchHandler } from "../src/handlers/implementations/invoice-fetch.js";
import { InvoiceNormalizeHandler } from "../src/handlers/implementations/invoice-normalize.js";

describe("Handler implementations", () => {
  const registry = new HandlerImplementationRegistry();

  it("lists registered handlers", () => {
    const names = registry.list();
    expect(names).toContain("invoice.fetch");
    expect(names.length).toBeGreaterThanOrEqual(9);
  });

  it("invoice fetch returns records", async () => {
    const handler = new InvoiceFetchHandler();
    const result = await handler.execute(
      { runId: "run_1", taskId: "t1", input: { vendorId: "v1" }, priorOutputs: {} },
      { id: "fetch", name: "Fetch", handler: "invoice.fetch", timeoutMs: 5000 },
    );
    expect(result.success).toBe(true);
    expect(Array.isArray(result.output.records)).toBe(true);
  });

  it("invoice normalize validates invoice numbers", async () => {
    const fetch = new InvoiceFetchHandler();
    const normalize = new InvoiceNormalizeHandler();
    const fetched = await fetch.execute(
      { runId: "run_1", taskId: "t1", input: {}, priorOutputs: {} },
      { id: "fetch", name: "Fetch", handler: "invoice.fetch", timeoutMs: 5000 },
    );
    const result = await normalize.execute(
      {
        runId: "run_1",
        taskId: "t2",
        input: {},
        priorOutputs: { fetch: fetched.output },
      },
      { id: "norm", name: "Norm", handler: "invoice.normalize", timeoutMs: 5000 },
    );
    expect(result.success).toBe(true);
    expect(result.output.lineCount).toBeGreaterThan(0);
  });
});
