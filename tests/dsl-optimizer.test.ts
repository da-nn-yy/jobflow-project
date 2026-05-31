import { describe, expect, it } from "vitest";
import { WorkflowDslOptimizer } from "../src/dsl/optimizer.js";
import type { WorkflowDslNode } from "../src/dsl/ast.js";

describe("WorkflowDslOptimizer", () => {
  const optimizer = new WorkflowDslOptimizer();

  it("topologically sorts tasks by dependencies", () => {
    const ast: WorkflowDslNode = {
      kind: "workflow",
      name: "w",
      version: 1,
      tasks: [
        { kind: "task", id: "c", handler: "h", timeoutMs: 1000, dependsOn: ["b"], optional: false },
        { kind: "task", id: "a", handler: "h", timeoutMs: 1000, dependsOn: [], optional: false },
        { kind: "task", id: "b", handler: "h", timeoutMs: 1000, dependsOn: ["a"], optional: false },
      ],
      constraints: [],
    };
    const out = optimizer.optimize(ast);
    const ids = out.tasks.map((t) => t.id);
    expect(ids.indexOf("a")).toBeLessThan(ids.indexOf("b"));
    expect(ids.indexOf("b")).toBeLessThan(ids.indexOf("c"));
  });
});
