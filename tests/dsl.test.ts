import { describe, expect, it } from "vitest";
import { WorkflowDslCompiler } from "../src/dsl/compiler.js";

const SAMPLE = `
workflow invoice_pipeline: {
  version: 1
  task fetch: {
    handler: "invoice.fetch"
    timeout: 30000
  }
  task norm: {
    handler: "invoice.normalize"
    timeout: 20000
    depends: ["fetch"]
  }
}
`;

describe("WorkflowDslCompiler", () => {
  const compiler = new WorkflowDslCompiler();

  it("compiles workflow DSL to job definition", () => {
    const def = compiler.compile(SAMPLE, "invoice_pipeline");
    expect(def.id).toBe("invoice_pipeline");
    expect(def.tasks).toHaveLength(2);
    expect(def.tasks[1].dependsOn).toEqual(["fetch"]);
  });
});
