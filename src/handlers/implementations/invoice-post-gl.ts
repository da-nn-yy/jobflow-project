import { TaskHandlerImplementation, type HandlerContext, type HandlerResult } from "./base.js";
import type { TaskDefinition } from "../../domain/job-definition.js";

export class InvoicePostGlHandler extends TaskHandlerImplementation {
  readonly name = "invoice.post_gl";

  async execute(ctx: HandlerContext, _task: TaskDefinition): Promise<HandlerResult> {
    const glAccount = String(ctx.input.glAccount ?? "4000-AP");
    const normalized = (ctx.priorOutputs.prepare?.normalized ??
      ctx.priorOutputs.normalize?.normalized ??
      []) as Array<Record<string, unknown>>;
    const entries = normalized.map((row, idx) => ({
      entryId: `JE-${ctx.runId.slice(-6)}-${idx}`,
      account: glAccount,
      debit: Number(row.amount ?? 0),
      credit: 0,
      memo: String(row.invoiceNumber ?? ""),
    }));
    const total = entries.reduce((s, e) => s + e.debit, 0);
    return this.ok({
      journalId: `JRNL-${Date.now()}`,
      entries,
      totalPosted: total,
      postedAt: new Date().toISOString(),
    });
  }
}
