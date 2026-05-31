import type { TaskDefinition } from "../domain/job-definition.js";
import type { TaskRun } from "../domain/task.js";
import { TaskStatus } from "../domain/types.js";
import type { TaskSimulator } from "./simulator.js";
import type { RetryHandler } from "./retry-handler.js";
import type { RetryPolicy } from "../domain/types.js";
import type { Clock } from "../utils/clock.js";
import type { Logger } from "../utils/logger.js";

export interface ExecuteResult {
  task: TaskRun;
  retryAfterMs?: number;
}

export class TaskExecutor {
  constructor(
    private readonly simulator: TaskSimulator,
    private readonly retryHandler: RetryHandler,
    private readonly clock: Clock,
    private readonly log: Logger,
  ) {}

  async run(
    taskRun: TaskRun,
    definition: TaskDefinition,
    policy: RetryPolicy,
    input: Record<string, unknown>,
  ): Promise<ExecuteResult> {
    const running: TaskRun = {
      ...taskRun,
      status: TaskStatus.Running,
      attempt: taskRun.attempt + 1,
      startedAt: this.clock.nowIso(),
    };

    this.log.debug("task executing", {
      taskId: running.id,
      handler: running.handler,
      attempt: running.attempt,
    });

    try {
      const result = await this.simulator.execute(definition.handler, input);
      if (!result.success) {
        return this.handleFailure(running, policy, result.errorMessage ?? "unknown error");
      }

      const finished: TaskRun = {
        ...running,
        status: TaskStatus.Succeeded,
        finishedAt: this.clock.nowIso(),
        output: result.output,
      };
      return { task: finished };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.handleFailure(running, policy, msg);
    }
  }

  private handleFailure(task: TaskRun, policy: RetryPolicy, message: string): ExecuteResult {
    const failed: TaskRun = {
      ...task,
      status: TaskStatus.Failed,
      finishedAt: this.clock.nowIso(),
      errorMessage: message,
    };

    const decision = this.retryHandler.decide(policy, failed);
    if (decision.retry) {
      const retrying: TaskRun = {
        ...failed,
        status: TaskStatus.Retrying,
        errorMessage: message,
      };
      return { task: retrying, retryAfterMs: decision.delayMs };
    }

    return { task: failed };
  }
}
