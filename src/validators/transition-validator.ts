import type { TransitionRule, WorkflowState } from "../domain/types.js";
import { TransitionError } from "../domain/errors.js";

export class TransitionValidator {
  constructor(private readonly rules: TransitionRule[]) {}

  canTransition(from: WorkflowState, to: WorkflowState, event: string): boolean {
    return this.rules.some((r) => r.from === from && r.to === to && r.event === event);
  }

  assertTransition(from: WorkflowState, to: WorkflowState, event: string): void {
    if (!this.canTransition(from, to, event)) {
      throw new TransitionError(
        `transition denied: ${from} -[${event}]-> ${to}`,
      );
    }
  }

  allowedEvents(from: WorkflowState): string[] {
    return [...new Set(this.rules.filter((r) => r.from === from).map((r) => r.event))];
  }
}

export const DEFAULT_TRANSITION_RULES: TransitionRule[] = [
  { from: "draft" as WorkflowState, to: "pending" as WorkflowState, event: "submit" },
  { from: "pending" as WorkflowState, to: "running" as WorkflowState, event: "start" },
  { from: "running" as WorkflowState, to: "waiting" as WorkflowState, event: "await" },
  { from: "waiting" as WorkflowState, to: "running" as WorkflowState, event: "resume" },
  { from: "running" as WorkflowState, to: "completed" as WorkflowState, event: "complete" },
  { from: "running" as WorkflowState, to: "failed" as WorkflowState, event: "fail" },
  { from: "waiting" as WorkflowState, to: "failed" as WorkflowState, event: "fail" },
  { from: "failed" as WorkflowState, to: "running" as WorkflowState, event: "retry" },
  { from: "failed" as WorkflowState, to: "dead_lettered" as WorkflowState, event: "dead_letter" },
  { from: "pending" as WorkflowState, to: "cancelled" as WorkflowState, event: "cancel" },
  { from: "running" as WorkflowState, to: "cancelled" as WorkflowState, event: "cancel" },
];
