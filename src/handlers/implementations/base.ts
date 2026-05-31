import type { TaskDefinition } from "../../domain/job-definition.js";

export interface HandlerContext {
  runId: string;
  taskId: string;
  input: Record<string, unknown>;
  priorOutputs: Record<string, Record<string, unknown>>;
}

export interface HandlerResult {
  success: boolean;
  output: Record<string, unknown>;
  metrics?: Record<string, number>;
}

export abstract class TaskHandlerImplementation {
  abstract readonly name: string;

  abstract execute(ctx: HandlerContext, task: TaskDefinition): Promise<HandlerResult>;

  protected ok(output: Record<string, unknown>, metrics?: Record<string, number>): HandlerResult {
    return { success: true, output, metrics };
  }

  protected fail(message: string): HandlerResult {
    return { success: false, output: { error: message } };
  }
}
