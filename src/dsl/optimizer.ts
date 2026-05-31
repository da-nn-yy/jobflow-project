import type { TaskDslNode, WorkflowDslNode } from "./ast.js";

export class WorkflowDslOptimizer {
  optimize(workflow: WorkflowDslNode): WorkflowDslNode {
    const tasks = this.sortTasksTopologically(workflow.tasks);
    const merged = this.mergeParallelTasks(tasks);
    return { ...workflow, tasks: merged };
  }

  private sortTasksTopologically(tasks: TaskDslNode[]): TaskDslNode[] {
    const byId = new Map(tasks.map((t) => [t.id, t]));
    const visited = new Set<string>();
    const out: TaskDslNode[] = [];

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      const t = byId.get(id);
      if (!t) return;
      for (const d of t.dependsOn) visit(d);
      out.push(t);
    };

    for (const t of tasks) visit(t.id);
    return out;
  }

  private mergeParallelTasks(tasks: TaskDslNode[]): TaskDslNode[] {
    const depth = new Map<string, number>();
    for (const t of tasks) {
      const depDepth = t.dependsOn.reduce((m, d) => Math.max(m, depth.get(d) ?? 0), 0);
      depth.set(t.id, depDepth + 1);
    }
    return [...tasks].sort((a, b) => (depth.get(a.id) ?? 0) - (depth.get(b.id) ?? 0));
  }
}
