import { TaskHandlerImplementation, type HandlerContext, type HandlerResult } from "./base.js";
import type { TaskDefinition } from "../../domain/job-definition.js";

export class ReconcileMatchHandler extends TaskHandlerImplementation {
  readonly name = "reconcile.match";

  async execute(ctx: HandlerContext, _task: TaskDefinition): Promise<HandlerResult> {
    const extract = ctx.priorOutputs.extract ?? {};
    const txns = (extract.transactions as Array<Record<string, unknown>>) ?? [];
    let matched = 0;
    let unmatched = 0;
    const exceptions: Array<Record<string, unknown>> = [];
    for (const t of txns) {
      if (Math.random() > 0.08) {
        matched += 1;
      } else {
        unmatched += 1;
        exceptions.push({ txnId: t.txnId, reason: "no_po_match" });
      }
    }
    return this.ok({
      matched,
      unmatched,
      matchRate: txns.length ? matched / txns.length : 1,
      exceptions: exceptions.slice(0, 50),
    });
  }
}
