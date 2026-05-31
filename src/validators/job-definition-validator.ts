import type { JobDefinition, TaskDefinition } from "../domain/job-definition.js";
import { ValidationError } from "../domain/errors.js";

export class JobDefinitionValidator {
  validate(definition: JobDefinition): void {
    const errors: string[] = [];

    if (!definition.tasks.length) {
      errors.push("job must define at least one task");
    }

    const allTaskIds = new Set(definition.tasks.map((t) => t.id));
    const seen = new Set<string>();
    for (const task of definition.tasks) {
      if (seen.has(task.id)) {
        errors.push(`duplicate task id: ${task.id}`);
        continue;
      }
      seen.add(task.id);
      this.validateTask(task, allTaskIds, errors);
    }

    if (definition.retryPolicy.maxAttempts < 1) {
      errors.push("retryPolicy.maxAttempts must be >= 1");
    }

    if (errors.length) {
      throw new ValidationError("job definition validation failed", errors);
    }
  }

  private validateTask(task: TaskDefinition, taskIds: Set<string>, errors: string[]): void {
    if (task.timeoutMs <= 0) {
      errors.push(`task ${task.id}: timeoutMs must be positive`);
    }
    for (const dep of task.dependsOn ?? []) {
      if (!taskIds.has(dep)) {
        errors.push(`task ${task.id}: depends on unknown task ${dep}`);
      }
      if (dep === task.id) {
        errors.push(`task ${task.id}: cannot depend on itself`);
      }
    }
  }

  validateDependencyOrder(tasks: TaskDefinition[]): void {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const byId = new Map(tasks.map((t) => [t.id, t]));

    const visit = (id: string) => {
      if (visited.has(id)) return;
      if (visiting.has(id)) {
        throw new ValidationError("circular task dependency detected", [id]);
      }
      visiting.add(id);
      const task = byId.get(id);
      for (const dep of task?.dependsOn ?? []) {
        visit(dep);
      }
      visiting.delete(id);
      visited.add(id);
    };

    for (const t of tasks) {
      visit(t.id);
    }
  }
}
