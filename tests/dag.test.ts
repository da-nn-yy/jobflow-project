import { describe, expect, it } from "vitest";
import { DagPlanner } from "../src/engine/dag-planner.js";

describe("DagPlanner", () => {
  const planner = new DagPlanner();

  it("orders tasks in dependency levels", () => {
    const plan = planner.plan([
      { id: "a", name: "A", handler: "h", timeoutMs: 1000 },
      { id: "b", name: "B", handler: "h", timeoutMs: 1000, dependsOn: ["a"] },
      { id: "c", name: "C", handler: "h", timeoutMs: 1000, dependsOn: ["a"] },
      { id: "d", name: "D", handler: "h", timeoutMs: 1000, dependsOn: ["b", "c"] },
    ]);
    expect(plan.levels[0]).toEqual(["a"]);
    expect(plan.levels[1]).toContain("b");
    expect(plan.levels[1]).toContain("c");
    expect(plan.levels[2]).toEqual(["d"]);
  });

  it("rejects cycles", () => {
    expect(() =>
      planner.plan([
        { id: "x", name: "X", handler: "h", timeoutMs: 1000, dependsOn: ["y"] },
        { id: "y", name: "Y", handler: "h", timeoutMs: 1000, dependsOn: ["x"] },
      ]),
    ).toThrow(/cycle/);
  });
});
