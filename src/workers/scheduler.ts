import type { TaskRun } from "../domain/task.js";
import type { TaskDefinition } from "../domain/job-definition.js";
import { TaskStatus } from "../domain/types.js";

export class TaskScheduler {
  nextRunnable(tasks: TaskRun[], definitions: TaskDefinition[]): TaskDefinition | undefined {
    const statusByDef = new Map(tasks.map((t) => [t.definitionTaskId, t.status]));

    for (const def of definitions) {
      const status = statusByDef.get(def.id);
      if (status === TaskStatus.Succeeded || status === TaskStatus.Skipped) {
        continue;
      }
      if (status === TaskStatus.Running || status === TaskStatus.Retrying) {
        continue;
      }
      if (this.dependenciesMet(def, statusByDef)) {
        return def;
      }
    }
    return undefined;
  }

  private dependenciesMet(def: TaskDefinition, statusByDef: Map<string, TaskStatus>): boolean {
    for (const dep of def.dependsOn ?? []) {
      const depStatus = statusByDef.get(dep);
      if (depStatus !== TaskStatus.Succeeded && depStatus !== TaskStatus.Skipped) {
        return false;
      }
    }
    return true;
  }

  allDone(tasks: TaskRun[], definitions: TaskDefinition[]): boolean {
    const required = definitions.filter((d) => !d.optional);
    const statusByDef = new Map(tasks.map((t) => [t.definitionTaskId, t.status]));
    return required.every((d) => {
      const s = statusByDef.get(d.id);
      return s === TaskStatus.Succeeded || s === TaskStatus.Skipped;
    });
  }
}
