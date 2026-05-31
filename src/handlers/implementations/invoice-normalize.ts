import { TaskHandlerImplementation, type HandlerContext, type HandlerResult } from "./base.js";
import type { TaskDefinition } from "../../domain/job-definition.js";

export class InvoiceNormalizeHandler extends TaskHandlerImplementation {
  readonly name = "invoice.normalize";

  async execute(ctx: HandlerContext, _task: TaskDefinition): Promise<HandlerResult> {
    const fetch = ctx.priorOutputs.pull ?? ctx.priorOutputs.fetch ?? ctx.input;
    const records = (fetch.records as Array<Record<string, unknown>>) ?? [];
    const normalized: Array<Record<string, unknown>> = records.map((r) => ({
      ...r,
      amount: Math.abs(Number(r.amount ?? 0)),
      normalized: true,
      taxCode: Number(r.amount ?? 0) > 1000 ? "STANDARD" : "EXEMPT",
    }));
    const invalid = normalized.filter((r) => !r.invoiceNumber);
    if (invalid.length) {
      return this.fail(`${invalid.length} rows missing invoice number`);
    }
    return this.ok({ normalized, lineCount: normalized.length });
  }
}
