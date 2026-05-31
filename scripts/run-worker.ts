/**
 * Polls active runs and drives execution (development helper).
 */
import { loadConfigSync } from "../src/config/loader.js";
import { SystemClock } from "../src/utils/clock.js";
import { createLogger } from "../src/utils/logger.js";
import { InMemoryJobStore } from "../src/storage/memory/job-store.js";
import { InMemoryWorkflowStore } from "../src/storage/memory/workflow-store.js";
import { InMemoryRunStore } from "../src/storage/memory/run-store.js";
import { InMemoryDeadLetterStore } from "../src/storage/memory/dead-letter-store.js";
import { TransitionValidator, DEFAULT_TRANSITION_RULES } from "../src/validators/transition-validator.js";
import { WorkflowStateMachine } from "../src/engine/state-machine.js";
import { TransitionGuard } from "../src/engine/transition-guard.js";
import { WorkflowOrchestrator } from "../src/engine/orchestrator.js";
import { TaskSimulator } from "../src/workers/simulator.js";
import { RetryHandler } from "../src/workers/retry-handler.js";
import { TaskExecutor } from "../src/workers/task-executor.js";
import { TaskScheduler } from "../src/workers/scheduler.js";
import { RuleEngine } from "../src/services/rule-engine.js";
import { ExecutionService } from "../src/services/execution-service.js";

async function main() {
  const config = loadConfigSync();
  const clock = new SystemClock();
  const log = createLogger(config);

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
    log,
  );

  const execution = new ExecutionService(
    jobStore,
    workflowStore,
    runStore,
    deadLetterStore,
    orchestrator,
    new TaskExecutor(new TaskSimulator(config), new RetryHandler(clock), clock, log),
    new TaskScheduler(),
    new RuleEngine(log),
    clock,
    log,
  );

  const active = await runStore.listActive();
  log.info("worker tick", { active: active.length });
  for (const run of active) {
    await execution.executeRun(run.id);
  }
}

main().catch(console.error);
