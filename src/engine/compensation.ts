import type { TaskRun } from "../domain/task.js";
import { TaskStatus } from "../domain/types.js";

export interface CompensationStep {
  taskId: string;
  action: string;
}

export class CompensationPlanner {
  planFailedRun(tasks: TaskRun[]): CompensationStep[] {
    const succeeded = tasks.filter((t) => t.status === TaskStatus.Succeeded);
    return succeeded.reverse().map((t) => ({
      taskId: t.definitionTaskId,
      action: `rollback.${t.handler}`,
    }));
  }
}
