import { TaskHandlerImplementation, type HandlerContext, type HandlerResult } from "./base.js";
import type { TaskDefinition } from "../../domain/job-definition.js";

export class OnboardProvisionHandler extends TaskHandlerImplementation {
  readonly name = "onboard.provision";

  async execute(ctx: HandlerContext, _task: TaskDefinition): Promise<HandlerResult> {
    const kyc = ctx.priorOutputs.kyc ?? ctx.priorOutputs.validate ?? {};
    const customerId = String(kyc.customerId ?? ctx.input.customerId ?? "");
    const resources = [
      { type: "database_schema", id: `db_${customerId}` },
      { type: "api_key", id: `key_${customerId}` },
      { type: "storage_bucket", id: `s3_${customerId}` },
    ];
    return this.ok({
      customerId,
      resources,
      provisionedAt: new Date().toISOString(),
    });
  }
}
