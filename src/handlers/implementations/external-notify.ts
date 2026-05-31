import { TaskHandlerImplementation, type HandlerContext, type HandlerResult } from "./base.js";
import type { TaskDefinition } from "../../domain/job-definition.js";

export class ExternalNotifyHandler extends TaskHandlerImplementation {
  readonly name = "external.risky_notify";

  async execute(ctx: HandlerContext, _task: TaskDefinition): Promise<HandlerResult> {
    const channel = String(ctx.input.channel ?? "email");
    const recipient = String(ctx.input.recipient ?? "ops@internal");
    if (Math.random() < 0.05) {
      return this.fail("upstream notification gateway timeout");
    }
    return this.ok({
      channel,
      recipient,
      messageId: `msg_${Date.now()}`,
      delivered: true,
    });
  }
}
