import { TaskHandlerImplementation, type HandlerContext, type HandlerResult } from "./base.js";
import type { TaskDefinition } from "../../domain/job-definition.js";

export class ReconcileExtractHandler extends TaskHandlerImplementation {
  readonly name = "reconcile.extract";

  async execute(ctx: HandlerContext, _task: TaskDefinition): Promise<HandlerResult> {
    const ledger = String(ctx.input.ledger ?? "PRIMARY");
    const pages = Number(ctx.input.pages ?? 3);
    const transactions: Array<Record<string, unknown>> = [];
    for (let p = 0; p < pages; p++) {
      for (let i = 0; i < 100; i++) {
        transactions.push({
          txnId: `${ledger}-p${p}-${i}`,
          amount: Math.round(Math.random() * 10000) / 100,
          postedDate: new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10),
        });
      }
    }
    return this.ok({ ledger, transactionCount: transactions.length, transactions });
  }
}
