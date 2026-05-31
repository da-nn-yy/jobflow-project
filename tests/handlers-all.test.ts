import { describe, expect, it } from "vitest";
import { HandlerImplementationRegistry } from "../src/handlers/implementations/registry.js";
import { InvoiceFetchHandler } from "../src/handlers/implementations/invoice-fetch.js";
import { ReconcileExtractHandler } from "../src/handlers/implementations/reconcile-extract.js";
import { ReconcileMatchHandler } from "../src/handlers/implementations/reconcile-match.js";
import { OnboardValidateHandler } from "../src/handlers/implementations/onboard-validate.js";
import { OnboardProvisionHandler } from "../src/handlers/implementations/onboard-provision.js";
import { InvoicePostGlHandler } from "../src/handlers/implementations/invoice-post-gl.js";
import { ReportAggregateHandler } from "../src/handlers/implementations/report-aggregate.js";
import { ExternalNotifyHandler } from "../src/handlers/implementations/external-notify.js";

const task = { id: "t", name: "T", handler: "h", timeoutMs: 5000 };
const ctx = (prior: Record<string, Record<string, unknown>> = {}) => ({
  runId: "run_x",
  taskId: "t",
  input: { tenantId: "acme", pages: 1 },
  priorOutputs: prior,
});

describe("All handler implementations", () => {
  const registry = new HandlerImplementationRegistry();

  it("registry resolves every handler", () => {
    for (const name of registry.list()) {
      expect(registry.get(name)).toBeDefined();
    }
  });

  it("reconcile extract produces transactions", async () => {
    const h = new ReconcileExtractHandler();
    const r = await h.execute(ctx(), task);
    expect(r.success).toBe(true);
    expect(r.output.transactionCount).toBeGreaterThan(0);
  });

  it("reconcile match uses prior extract output", async () => {
    const extract = await new ReconcileExtractHandler().execute(ctx(), task);
    const match = await new ReconcileMatchHandler().execute(ctx({ extract: extract.output }), task);
    expect(match.success).toBe(true);
    expect(typeof match.output.matchRate).toBe("number");
  });

  it("onboard validate and provision chain", async () => {
    const validate = await new OnboardValidateHandler().execute(
      { ...ctx(), input: { customerId: "cust_100" } },
      task,
    );
    expect(validate.success).toBe(true);
    const provision = await new OnboardProvisionHandler().execute(
      ctx({ validate: validate.output }),
      task,
    );
    expect(provision.success).toBe(true);
    expect(provision.output.resources).toHaveLength(3);
  });

  it("invoice post gl and report aggregate succeed", async () => {
    const fetch = await new InvoiceFetchHandler().execute(ctx(), task);
    const post = await new InvoicePostGlHandler().execute(
      ctx({ normalize: { normalized: fetch.output.records } }),
      task,
    );
    expect(post.success).toBe(true);
    const report = await new ReportAggregateHandler().execute(ctx({ extract: { transactions: [] } }), task);
    expect(report.success).toBe(true);
  });

  it("external notify returns delivery id", async () => {
    const r = await new ExternalNotifyHandler().execute(ctx(), task);
    expect(r.success).toBe(true);
    expect(r.output.messageId).toBeDefined();
  });
});
