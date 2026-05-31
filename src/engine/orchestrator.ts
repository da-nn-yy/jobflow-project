import type { JobDefinition } from "../domain/job-definition.js";
import type { WorkflowInstance } from "../domain/workflow-instance.js";
import { WorkflowState } from "../domain/types.js";
import type { DomainEventListener } from "../domain/events.js";
import type { WorkflowStore, RunStore } from "../storage/interfaces.js";
import { WorkflowStateMachine } from "./state-machine.js";
import { TransitionGuard } from "./transition-guard.js";
import type { Clock } from "../utils/clock.js";
import type { Logger } from "../utils/logger.js";

export class WorkflowOrchestrator {
  private listeners: DomainEventListener[] = [];

  constructor(
    private readonly stateMachine: WorkflowStateMachine,
    private readonly guard: TransitionGuard,
    private readonly workflowStore: WorkflowStore,
    private readonly runStore: RunStore,
    private readonly clock: Clock,
    private readonly log: Logger,
  ) {}

  onEvent(listener: DomainEventListener): void {
    this.listeners.push(listener);
  }

  private emit(event: Parameters<DomainEventListener>[0]): void {
    for (const l of this.listeners) {
      l(event);
    }
  }

  async applyTransition(
    instance: WorkflowInstance,
    event: string,
    target: WorkflowState,
    actor: string,
  ): Promise<WorkflowInstance> {
    this.guard.evaluate({ instance, event, target });
    const next = this.stateMachine.transition(instance, event, target, actor);
    await this.workflowStore.save(next);

    const run = await this.runStore.get(next.runId);
    if (run) {
      run.status = target;
      if (this.stateMachine.isTerminal(target)) {
        run.finishedAt = this.clock.nowIso();
      }
      await this.runStore.save(run);
    }

    this.emit({
      type: "workflow.transitioned",
      runId: next.runId,
      from: instance.state,
      to: target,
      event,
      at: this.clock.nowIso(),
    });

    this.log.info("workflow transitioned", {
      workflowId: next.id,
      from: instance.state,
      to: target,
      event,
    });

    return next;
  }

  async startRun(
    _definition: JobDefinition,
    workflow: WorkflowInstance,
  ): Promise<WorkflowInstance> {
    let current = workflow;
    if (current.state === WorkflowState.Pending) {
      current = await this.applyTransition(current, "start", WorkflowState.Running, "orchestrator");
    }
    return current;
  }
}
