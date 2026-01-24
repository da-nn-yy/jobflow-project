import type { RunId } from "../domain/types.js";
import { WorkflowState, FailureReason } from "../domain/types.js";
import { TaskStatus } from "../domain/types.js";
import type { JobDefinitionStore, WorkflowStore, RunStore, DeadLetterStore } from "../storage/interfaces.js";
import { WorkflowOrchestrator } from "../engine/orchestrator.js";
import { RunContextFactory } from "../engine/run-context.js";
import { TaskExecutor } from "../workers/task-executor.js";
import { TaskScheduler } from "../workers/scheduler.js";
import { RuleEngine } from "./rule-engine.js";
import { NotFoundError } from "../domain/errors.js";
import type { Logger } from "../utils/logger.js";
import type { Clock } from "../utils/clock.js";
import type { RunLockRegistry } from "../engine/run-lock.js";
import type { MetricsCollector } from "../metrics/collector.js";

export class ExecutionService {
  private readonly runContextFactory = new RunContextFactory();
  private readonly localLocks = new Set<RunId>();

  constructor(
    private readonly jobStore: JobDefinitionStore,
    private readonly workflowStore: WorkflowStore,
    private readonly runStore: RunStore,
    private readonly deadLetterStore: DeadLetterStore,
    private readonly orchestrator: WorkflowOrchestrator,
    private readonly taskExecutor: TaskExecutor,
    private readonly scheduler: TaskScheduler,
    private readonly ruleEngine: RuleEngine,
    private readonly clock: Clock,
    private readonly log: Logger,
    private readonly runLocks?: RunLockRegistry,
    private readonly metrics?: MetricsCollector,
  ) {}

  async executeRun(runId: RunId): Promise<void> {
    if (this.localLocks.has(runId)) {
      this.log.warn("run already executing", { runId });
      return;
    }
    this.localLocks.add(runId);
    const owner = "execution-service";
    this.runLocks?.acquire(runId, owner);

    try {
      const run = await this.runStore.get(runId);
      if (!run) throw new NotFoundError("JobRun", runId);

      const definition = await this.jobStore.get(run.jobId);
      if (!definition) throw new NotFoundError("JobDefinition", run.jobId);

      let workflow = await this.workflowStore.getByRunId(runId);
      if (!workflow) throw new NotFoundError("WorkflowInstance", runId);

      workflow = await this.orchestrator.startRun(definition, workflow);

      while (workflow.state === WorkflowState.Running) {
        const nextDef = this.scheduler.nextRunnable(workflow.tasks, definition.tasks);
        if (!nextDef) {
          if (this.scheduler.allDone(workflow.tasks, definition.tasks)) {
            this.ruleEngine.apply(
              definition,
              {
                context: workflow.context,
                taskOutputs: this.runContextFactory.taskOutputs({
                  run,
                  definition,
                  workflow,
                }),
              },
            );
            workflow = await this.orchestrator.applyTransition(
              workflow,
              "complete",
              WorkflowState.Completed,
              "execution-service",
            );
          } else {
            workflow = await this.orchestrator.applyTransition(
              workflow,
              "await",
              WorkflowState.Waiting,
              "execution-service",
            );
          }
          break;
        }

        const taskRun = workflow.tasks.find((t) => t.definitionTaskId === nextDef.id)!;
        const started = Date.now();
        const result = await this.taskExecutor.run(
          taskRun,
          nextDef,
          definition.retryPolicy,
          workflow.context,
        );
        this.metrics?.recordTaskDuration(nextDef.handler, Date.now() - started);

        workflow = await this.updateTask(workflow, result.task);

        if (result.retryAfterMs !== undefined) {
          await this.sleep(result.retryAfterMs);
          const retryTask = { ...result.task, status: TaskStatus.Queued };
          workflow = await this.updateTask(workflow, retryTask);
        }

        if (result.task.status === TaskStatus.Failed) {
          workflow = await this.orchestrator.applyTransition(
            workflow,
            "fail",
            WorkflowState.Failed,
            "execution-service",
          );
          break;
        }
      }

      if (workflow.state === WorkflowState.Failed) {
        const attempts = workflow.tasks.reduce((s, t) => s + t.attempt, 0);
        if (attempts >= definition.retryPolicy.maxAttempts * definition.tasks.length) {
          workflow = await this.orchestrator.applyTransition(
            workflow,
            "dead_letter",
            WorkflowState.DeadLettered,
            "execution-service",
          );
          await this.deadLetterStore.push(runId, {
            reason: FailureReason.MaxRetriesExceeded,
            workflowId: workflow.id,
          });
        }
      }
    } finally {
      this.localLocks.delete(runId);
      this.runLocks?.release(runId, owner);
    }
  }

  private async updateTask(
    workflow: NonNullable<Awaited<ReturnType<WorkflowStore["getByRunId"]>>>,
    task: import("../domain/task.js").TaskRun,
  ) {
    const updated = {
      ...workflow,
      tasks: workflow.tasks.map((t) => (t.id === task.id ? task : t)),
      updatedAt: this.clock.nowIso(),
    };
    await this.workflowStore.save(updated);
    return updated;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
