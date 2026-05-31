import { TaskHandlerImplementation, type HandlerContext, type HandlerResult } from "./base.js";
import type { TaskDefinition } from "../../domain/job-definition.js";

export class OnboardValidateHandler extends TaskHandlerImplementation {
  readonly name = "onboard.validate";

  async execute(ctx: HandlerContext, _task: TaskDefinition): Promise<HandlerResult> {
    const customerId = String(ctx.input.customerId ?? "");
    if (!customerId) return this.fail("customerId required");
    const riskScore = this.computeRiskScore(customerId, ctx.input);
    if (riskScore > 85) return this.fail(`risk score ${riskScore} exceeds threshold`);
    return this.ok({ customerId, riskScore, validatedAt: new Date().toISOString() });
  }

  private computeRiskScore(customerId: string, input: Record<string, unknown>): number {
    let score = customerId.length % 40;
    if (input.country === "XX") score += 30;
    if (input.highRiskIndustry === true) score += 25;
    return Math.min(100, score);
  }
}
