import type { WorkflowInstance, WorkflowHistoryEntry } from "../domain/workflow-instance.js";
import { WorkflowState } from "../domain/types.js";
import type { TransitionValidator } from "../validators/transition-validator.js";
import type { Clock } from "../utils/clock.js";

export class WorkflowStateMachine {
  constructor(
    private readonly transitions: TransitionValidator,
    private readonly clock: Clock,
  ) {}

  transition(
    instance: WorkflowInstance,
    event: string,
    target: WorkflowState,
    actor: string,
    note?: string,
  ): WorkflowInstance {
    this.transitions.assertTransition(instance.state, target, event);

    const entry: WorkflowHistoryEntry = {
      at: this.clock.nowIso(),
      from: instance.state,
      to: target,
      event,
      actor,
      note,
    };

    return {
      ...instance,
      state: target,
      history: [...instance.history, entry],
      version: instance.version + 1,
      updatedAt: this.clock.nowIso(),
    };
  }

  isTerminal(state: WorkflowState): boolean {
    return (
      state === WorkflowState.Completed ||
      state === WorkflowState.Cancelled ||
      state === WorkflowState.DeadLettered
    );
  }
}
