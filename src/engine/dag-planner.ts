import type { TaskDefinition } from "../domain/job-definition.js";

export interface DagNode {
  taskId: string;
  dependsOn: string[];
  weightMs: number;
}

export interface DagPlan {
  levels: string[][];
  criticalPath: string[];
  estimatedMs: number;
}

export class DagPlanner {
  buildGraph(tasks: TaskDefinition[]): Map<string, DagNode> {
    const graph = new Map<string, DagNode>();
    for (const t of tasks) {
      graph.set(t.id, {
        taskId: t.id,
        dependsOn: [...(t.dependsOn ?? [])],
        weightMs: t.timeoutMs,
      });
    }
    this.assertAcyclic(graph);
    return graph;
  }

  plan(tasks: TaskDefinition[]): DagPlan {
    const graph = this.buildGraph(tasks);
    const levels = this.topologicalLevels(graph);
    const criticalPath = this.criticalPath(graph);
    const estimatedMs = criticalPath.reduce((sum, id) => sum + (graph.get(id)?.weightMs ?? 0), 0);
    return { levels, criticalPath, estimatedMs };
  }

  private topologicalLevels(graph: Map<string, DagNode>): string[][] {
    const inDegree = new Map<string, number>();
    for (const id of graph.keys()) inDegree.set(id, 0);
    for (const node of graph.values()) {
      inDegree.set(node.taskId, node.dependsOn.length);
    }
    const levels: string[][] = [];
    let ready = [...graph.keys()].filter((id) => (inDegree.get(id) ?? 0) === 0);
    while (ready.length) {
      levels.push([...ready]);
      const next = new Set<string>();
      for (const id of ready) {
        for (const [taskId, node] of graph) {
          if (!node.dependsOn.includes(id)) continue;
          const deg = (inDegree.get(taskId) ?? 0) - 1;
          inDegree.set(taskId, deg);
          if (deg === 0) next.add(taskId);
        }
      }
      ready = [...next];
    }
    return levels;
  }

  private criticalPath(graph: Map<string, DagNode>): string[] {
    const memo = new Map<string, { cost: number; path: string[] }>();
    let best: { cost: number; path: string[] } = { cost: 0, path: [] };
    for (const id of graph.keys()) {
      const result = this.longestFrom(id, graph, memo);
      if (result.cost > best.cost) best = result;
    }
    return best.path;
  }

  private longestFrom(
    id: string,
    graph: Map<string, DagNode>,
    memo: Map<string, { cost: number; path: string[] }>,
  ): { cost: number; path: string[] } {
    const cached = memo.get(id);
    if (cached) return cached;
    const node = graph.get(id);
    if (!node) return { cost: 0, path: [] };
    let bestChild: { cost: number; path: string[] } = { cost: 0, path: [] };
    for (const dep of node.dependsOn) {
      const child = this.longestFrom(dep, graph, memo);
      if (child.cost > bestChild.cost) bestChild = child;
    }
    const result = {
      cost: node.weightMs + bestChild.cost,
      path: [...bestChild.path, id],
    };
    memo.set(id, result);
    return result;
  }

  private assertAcyclic(graph: Map<string, DagNode>): void {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string) => {
      if (visited.has(id)) return;
      if (visiting.has(id)) throw new Error(`cycle detected at task ${id}`);
      visiting.add(id);
      const node = graph.get(id);
      for (const dep of node?.dependsOn ?? []) visit(dep);
      visiting.delete(id);
      visited.add(id);
    };
    for (const id of graph.keys()) visit(id);
  }
}
