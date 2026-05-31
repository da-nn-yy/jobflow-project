import type { WorkflowInstance } from "../domain/workflow-instance.js";
import { TransitionError } from "../domain/errors.js";
import { WorkflowState } from "../domain/types.js";
import type { TaskRun } from "../domain/task.js";
import { TaskStatus } from "../domain/types.js";

export interface GuardContext {
  instance: WorkflowInstance;
  event: string;
  target: WorkflowState;
}

export class TransitionGuard {
  evaluate(ctx: GuardContext): void {
    const { instance, event, target } = ctx;

    if (event === "complete" && target === WorkflowState.Completed) {
      this.assertAllRequiredTasksSucceeded(instance.tasks);
    }

    if (event === "retry" && target === WorkflowState.Running) {
      const failed = instance.tasks.filter((t) => t.status === TaskStatus.Failed);
      if (!failed.length) {
        throw new TransitionError("retry requires at least one failed task");
      }
    }

    if (event === "cancel" && instance.state === WorkflowState.Running) {
      const running = instance.tasks.some((t) => t.status === TaskStatus.Running);
      if (running) {
        throw new TransitionError("cannot cancel while tasks are running");
      }
    }
  }

  private assertAllRequiredTasksSucceeded(tasks: TaskRun[]): void {
    const incomplete = tasks.filter(
      (t) => t.status !== TaskStatus.Succeeded && t.status !== TaskStatus.Skipped,
    );
    if (incomplete.length) {
      throw new TransitionError(
        `cannot complete workflow: ${incomplete.length} tasks not succeeded`,
      );
    }
  }
}
