import { describe, expect, it } from "vitest";
import { CompensationStack } from "../src/saga/compensation-stack.js";
import type { SagaStepState } from "../src/saga/saga-types.js";

function step(id: string, status: SagaStepState["status"]): SagaStepState {
  return { stepId: id, status, attempt: 1 };
}

describe("CompensationStack", () => {
  it("only stacks completed steps", () => {
    const stack = new CompensationStack();
    stack.push(step("a", "completed"));
    stack.push(step("b", "failed"));
    stack.push(step("c", "completed"));
    expect(stack.size()).toBe(2);
  });

  it("pops in LIFO order for compensation", () => {
    const stack = new CompensationStack();
    stack.push(step("a", "completed"));
    stack.push(step("b", "completed"));
    expect(stack.pop()?.stepId).toBe("b");
    expect(stack.pop()?.stepId).toBe("a");
  });

  it("returns reverse completion order", () => {
    const stack = new CompensationStack();
    stack.push(step("a", "completed"));
    stack.push(step("b", "completed"));
    stack.push(step("c", "completed"));
    expect(stack.toCompensateOrder().map((s) => s.stepId)).toEqual(["c", "b", "a"]);
  });

  it("clears all entries", () => {
    const stack = new CompensationStack();
    stack.push(step("a", "completed"));
    stack.clear();
    expect(stack.size()).toBe(0);
    expect(stack.peek()).toBeUndefined();
  });
});
