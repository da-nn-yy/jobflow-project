import type { EngineConfig } from "./config/defaults.js";
import { loadConfigSync } from "./config/loader.js";
import { SystemClock } from "./utils/clock.js";
import { createLogger } from "./utils/logger.js";
import type { Logger } from "./utils/logger.js";
import { InMemoryJobStore } from "./storage/memory/job-store.js";
import { InMemoryWorkflowStore } from "./storage/memory/workflow-store.js";
import { InMemoryRunStore } from "./storage/memory/run-store.js";
import { InMemoryDeadLetterStore } from "./storage/memory/dead-letter-store.js";
import { InMemoryScheduleStore } from "./storage/memory/schedule-store.js";
import { InMemoryWebhookStore } from "./storage/memory/webhook-store.js";
import { TransitionValidator, DEFAULT_TRANSITION_RULES } from "./validators/transition-validator.js";
import { WorkflowStateMachine } from "./engine/state-machine.js";
import { TransitionGuard } from "./engine/transition-guard.js";
import { WorkflowOrchestrator } from "./engine/orchestrator.js";
import { RunLockRegistry } from "./engine/run-lock.js";
import { TaskSimulator } from "./workers/simulator.js";
import { RetryHandler } from "./workers/retry-handler.js";
import { TaskExecutor } from "./workers/task-executor.js";
import { TaskScheduler } from "./workers/scheduler.js";
import { WorkerPool } from "./workers/pool.js";
import { CronTicker } from "./workers/cron-ticker.js";
import { JobService } from "./services/job-service.js";
import { WorkflowService } from "./services/workflow-service.js";
import { RuleEngine } from "./services/rule-engine.js";
import { ExecutionService } from "./services/execution-service.js";
import { ScheduleService } from "./services/schedule-service.js";
import { WebhookService } from "./services/webhook-service.js";
import { AuditService } from "./services/audit-service.js";
import { TenantService } from "./services/tenant-service.js";
import { EventBus } from "./services/event-bus.js";
import { HandlerRegistry } from "./handlers/registry.js";
import { HandlerResolver } from "./handlers/resolver.js";
import { MetricsRegistry } from "./metrics/registry.js";
import { MetricsCollector } from "./metrics/collector.js";
import { InMemoryAuditSink } from "./audit/memory-sink.js";
import { AuditTrail } from "./audit/trail.js";
import { WebhookDispatcher } from "./webhooks/dispatcher.js";
import { WebhookDeliveryStore } from "./webhooks/delivery-store.js";
import { ApiKeyStore, ApiKeyAuthenticator } from "./security/auth.js";
import type { TenantId } from "./domain/tenant.js";

export interface AppContainer {
  config: EngineConfig;
  log: Logger;
  jobService: JobService;
  workflowService: WorkflowService;
  executionService: ExecutionService;
  scheduleService: ScheduleService;
  webhookService: WebhookService;
  auditService: AuditService;
  tenantService: TenantService;
  handlerRegistry: HandlerRegistry;
  metricsRegistry: MetricsRegistry;
  eventBus: EventBus;
  apiKeyAuth: ApiKeyAuthenticator;
  deadLetterStore: InMemoryDeadLetterStore;
  webhookDeliveries: WebhookDeliveryStore;
  workerPool: WorkerPool;
  cronTicker: CronTicker;
  runLocks: RunLockRegistry;
}

export function createContainer(config?: EngineConfig): AppContainer {
  const resolved = config ?? loadConfigSync();
  const clock = new SystemClock();
  const log = createLogger(resolved);

  const jobStore = new InMemoryJobStore();
  const workflowStore = new InMemoryWorkflowStore();
  const runStore = new InMemoryRunStore();
  const deadLetterStore = new InMemoryDeadLetterStore();
  const scheduleStore = new InMemoryScheduleStore();
  const webhookStore = new InMemoryWebhookStore();
  const webhookDeliveries = new WebhookDeliveryStore();
  const metricsRegistry = new MetricsRegistry();
  const eventBus = new EventBus();
  const runLocks = new RunLockRegistry();

  const metricsCollector = new MetricsCollector(metricsRegistry);
  eventBus.subscribe((e) => metricsCollector.onDomainEvent(e));

  const orchestrator = new WorkflowOrchestrator(
    new WorkflowStateMachine(new TransitionValidator(DEFAULT_TRANSITION_RULES), clock),
    new TransitionGuard(),
    workflowStore,
    runStore,
    clock,
    log.child({ component: "orchestrator" }),
  );
  orchestrator.onEvent((e) => eventBus.publish(e));

  const handlerRegistry = new HandlerRegistry();
  const handlerResolver = new HandlerResolver(handlerRegistry);

  const taskExecutor = new TaskExecutor(
    new TaskSimulator(resolved),
    new RetryHandler(clock),
    clock,
    log.child({ component: "executor" }),
  );

  const auditService = new AuditService(new AuditTrail(new InMemoryAuditSink(), clock));
  const tenantService = new TenantService(jobStore, runStore);
  tenantService.register("tenant_dev" as TenantId, "development");

  const apiKeyStore = new ApiKeyStore();
  const apiKeyAuth = new ApiKeyAuthenticator(apiKeyStore);

  const webhookService = new WebhookService(
    webhookStore,
    new WebhookDispatcher(log.child({ component: "webhooks" }), clock),
    webhookDeliveries,
  );

  eventBus.subscribe((e) => {
    if (e.type === "run.failed" || e.type === "run.completed") {
      void webhookService.emit("tenant_dev" as TenantId, e.type === "run.failed" ? "run.failed" : "run.completed", {
        runId: e.runId,
      });
    }
  });

  const jobService = new JobService(jobStore, clock, log.child({ component: "jobs" }), handlerRegistry, handlerResolver);
  const workflowService = new WorkflowService(jobStore, workflowStore, runStore, clock);
  const scheduleService = new ScheduleService(scheduleStore, clock);
  const executionService = new ExecutionService(
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
    runLocks,
    metricsCollector,
  );

  const cronTicker = new CronTicker(scheduleService, workflowService, executionService, log.child({ component: "cron" }));

  return {
    config: resolved,
    log,
    jobService,
    workflowService,
    executionService,
    scheduleService,
    webhookService,
    auditService,
    tenantService,
    handlerRegistry,
    metricsRegistry,
    eventBus,
    apiKeyAuth,
    deadLetterStore,
    webhookDeliveries,
    workerPool: new WorkerPool(resolved.workerConcurrency),
    cronTicker,
    runLocks,
  };
}
