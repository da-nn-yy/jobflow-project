import { describe, expect, it } from "vitest";
import { ExpressionEvaluator } from "../src/expressions/evaluator.js";

describe("ExpressionEvaluator", () => {
  const ev = new ExpressionEvaluator();

  it("evaluates comparisons on ctx", () => {
    expect(ev.evaluateBoolean("ctx.amount > 100", { ctx: { amount: 150 } })).toBe(true);
    expect(ev.evaluateBoolean("ctx.amount > 100", { ctx: { amount: 50 } })).toBe(false);
  });

  it("supports builtins", () => {
    expect(ev.evaluateBoolean('isempty(ctx.name)', { ctx: { name: "" } })).toBe(true);
    expect(ev.evaluateBoolean('contains(ctx.tags, "prod")', { ctx: { tags: "prod-east" } })).toBe(true);
  });

  it("combines logical operators", () => {
    expect(ev.evaluateBoolean("ctx.a == 1 && ctx.b == 2", { ctx: { a: 1, b: 2 } })).toBe(true);
  });
});
