import { describe, expect, it } from "vitest";
import { WorkflowDslLexer } from "../src/dsl/lexer.js";

describe("WorkflowDslLexer", () => {
  it("tokenizes keywords, strings, and punctuation", () => {
    const tokens = new WorkflowDslLexer(
      'workflow demo: { version: 1 task t: { handler: "invoice.fetch" timeout: 5000 } }',
    ).tokenize();
    const types = tokens.map((t) => t.type);
    expect(types).toContain("keyword");
    expect(types).toContain("string");
    expect(types).toContain("lbrace");
    expect(types.filter((t) => t.type === "eof").length).toBeGreaterThanOrEqual(0);
    expect(tokens[tokens.length - 1]?.type).toBe("eof");
  });

  it("skips hash comments", () => {
    const tokens = new WorkflowDslLexer("# comment\nworkflow x: { version: 1 }").tokenize();
    expect(tokens.some((t) => t.value === "comment")).toBe(false);
    expect(tokens.some((t) => t.value === "workflow")).toBe(true);
  });
});
