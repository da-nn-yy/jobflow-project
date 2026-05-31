import { TaskHandlerImplementation, type HandlerContext, type HandlerResult } from "./base.js";
import type { TaskDefinition } from "../../domain/job-definition.js";

export class ReportAggregateHandler extends TaskHandlerImplementation {
  readonly name = "report.aggregate";

  async execute(ctx: HandlerContext, _task: TaskDefinition): Promise<HandlerResult> {
    const slices = Object.entries(ctx.priorOutputs);
    const summary: Record<string, unknown> = { runId: ctx.runId };
    for (const [key, val] of slices) {
      if (val && typeof val === "object") {
        summary[key] = {
          keys: Object.keys(val),
          numericFields: Object.entries(val)
            .filter(([, v]) => typeof v === "number")
            .map(([k, v]) => ({ k, v })),
        };
      }
    }
    return this.ok({ summary, generatedAt: new Date().toISOString() });
  }
}
