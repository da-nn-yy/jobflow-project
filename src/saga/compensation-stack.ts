import type { SagaStepState } from "./saga-types.js";

export class CompensationStack {
  private readonly completed: SagaStepState[] = [];

  push(step: SagaStepState): void {
    if (step.status === "completed") {
      this.completed.push(step);
    }
  }

  pop(): SagaStepState | undefined {
    return this.completed.pop();
  }

  peek(): SagaStepState | undefined {
    return this.completed[this.completed.length - 1];
  }

  size(): number {
    return this.completed.length;
  }

  toCompensateOrder(): SagaStepState[] {
    return [...this.completed].reverse();
  }

  clear(): void {
    this.completed.length = 0;
  }
}
