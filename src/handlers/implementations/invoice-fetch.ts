import { TaskHandlerImplementation, type HandlerContext, type HandlerResult } from "./base.js";
import type { TaskDefinition } from "../../domain/job-definition.js";

export class InvoiceFetchHandler extends TaskHandlerImplementation {
  readonly name = "invoice.fetch";

  async execute(ctx: HandlerContext, _task: TaskDefinition): Promise<HandlerResult> {
    const tenantId = String(ctx.input.tenantId ?? "unknown");
    const batchId = `batch_${Date.now()}`;
    const records = this.synthesizeBatch(tenantId, Number(ctx.input.expectedRows ?? 50));
    return this.ok({
      batchId,
      recordCount: records.length,
      records,
      fetchedAt: new Date().toISOString(),
    }, { rows: records.length, latency_simulated_ms: 120 });
  }

  private synthesizeBatch(tenantId: string, count: number): Array<Record<string, unknown>> {
    const rows: Array<Record<string, unknown>> = [];
    for (let i = 0; i < count; i++) {
      rows.push({
        invoiceNumber: `INV-${tenantId}-${1000 + i}`,
        amount: Math.round((Math.random() * 5000 + 100) * 100) / 100,
        currency: i % 5 === 0 ? "EUR" : "USD",
      });
    }
    return rows;
  }
}
