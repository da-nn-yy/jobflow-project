import type { TaskDefinition } from "../domain/job-definition.js";
import type { HandlerRegistry } from "./registry.js";

export class HandlerResolver {
  constructor(private readonly registry: HandlerRegistry) {}

  resolveTasks(tasks: TaskDefinition[]): void {
    for (const t of tasks) {
      const manifest = this.registry.get(t.handler);
      if (!manifest) continue;
      if (t.timeoutMs > manifest.timeoutMs * 2) {
        // allow override but cap at 2x manifest default for safety
        t.timeoutMs = manifest.timeoutMs * 2;
      }
    }
  }
}
