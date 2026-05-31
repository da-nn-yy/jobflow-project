import type { EngineConfig } from "./config/defaults.js";
import { loadConfigSync } from "./config/loader.js";
import { SystemClock } from "./utils/clock.js";
import { createLogger } from "./utils/logger.js";
import type { Logger } from "./utils/logger.js";
import { InMemoryJobStore } from "./storage/memory/job-store.js";
import { InMemoryWorkflowStore } from "./storage/memory/workflow-store.js";
import { InMemoryRunStore } from "./storage/memory/run-store.js";
import { InMemoryDeadLetterStore } from "./storage/memory/dead-letter-store.js";
import { TransitionValidator, DEFAULT_TRANSITION_RULES } from "./validators/transition-validator.js";
import { WorkflowStateMachine } from "./engine/state-machine.js";
import { TransitionGuard } from "./engine/transition-guard.js";
import { WorkflowOrchestrator } from "./engine/orchestrator.js";
import { TaskSimulator } from "./workers/simulator.js";
import { RetryHandler } from "./workers/retry-handler.js";
import { TaskExecutor } from "./workers/task-executor.js";
import { TaskScheduler } from "./workers/scheduler.js";
import { JobService } from "./services/job-service.js";
import { WorkflowService } from "./services/workflow-service.js";
import { RuleEngine } from "./services/rule-engine.js";
import { ExecutionService } from "./services/execution-service.js";

export interface AppContainer {
  config: EngineConfig;
  log: Logger;
  jobService: JobService;
  workflowService: WorkflowService;
  executionService: ExecutionService;
}

export function createContainer(config?: EngineConfig): AppContainer {
  const resolved = config ?? loadConfigSync();
  const clock = new SystemClock();
  const log = createLogger(resolved);

  const jobStore = new InMemoryJobStore();
  const workflowStore = new InMemoryWorkflowStore();
  const runStore = new InMemoryRunStore();
  const deadLetterStore = new InMemoryDeadLetterStore();

  const orchestrator = new WorkflowOrchestrator(
    new WorkflowStateMachine(new TransitionValidator(DEFAULT_TRANSITION_RULES), clock),
    new TransitionGuard(),
    workflowStore,
    runStore,
    clock,
    log.child({ component: "orchestrator" }),
  );

  const taskExecutor = new TaskExecutor(
    new TaskSimulator(resolved),
    new RetryHandler(clock),
    clock,
    log.child({ component: "executor" }),
  );

  return {
    config: resolved,
    log,
    jobService: new JobService(jobStore, clock, log.child({ component: "jobs" })),
    workflowService: new WorkflowService(jobStore, workflowStore, runStore, clock),
    executionService: new ExecutionService(
      jobStore,
      workflowStore,
      runStore,
      deadLetterStore,
      orchestrator,
      taskExecutor,
      new TaskScheduler(),
      new RuleEngine(log.child({ component: "rules" })),
      clock,
      log.child({ component: "execution" }),
    ),
  };
}
