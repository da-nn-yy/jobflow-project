import type { RetryPolicy } from "../domain/types.js";
import { computeBackoffDelay, shouldRetry } from "../domain/retry-policy.js";
import { ExecutionError } from "../domain/errors.js";
import { FailureReason } from "../domain/types.js";
import type { TaskRun } from "../domain/task.js";
import type { Clock } from "../utils/clock.js";

export interface RetryDecision {
  retry: boolean;
  delayMs: number;
  nextAttempt: number;
}

export class RetryHandler {
  constructor(private readonly clock: Clock) {}

  decide(policy: RetryPolicy, task: TaskRun): RetryDecision {
    const nextAttempt = task.attempt + 1;
    if (!shouldRetry(policy, nextAttempt)) {
      return { retry: false, delayMs: 0, nextAttempt };
    }
    const delayMs = computeBackoffDelay(policy, nextAttempt);
    return { retry: true, delayMs, nextAttempt };
  }

  assertWithinAttempts(policy: RetryPolicy, task: TaskRun): void {
    if (task.attempt >= policy.maxAttempts) {
      throw new ExecutionError(
        FailureReason.MaxRetriesExceeded,
        `task ${task.definitionTaskId} exceeded max attempts (${policy.maxAttempts})`,
      );
    }
  }

  scheduleNote(task: TaskRun, delayMs: number): string {
    return `retry #${task.attempt + 1} scheduled at ${this.clock.nowIso()} (+${delayMs}ms)`;
  }
}
