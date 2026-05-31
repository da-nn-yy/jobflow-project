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
import { BatchService } from "./services/batch-service.js";
import { HandlerRegistry } from "./handlers/registry.js";
import { HandlerResolver } from "./handlers/resolver.js";
import { HandlerImplementationRegistry } from "./handlers/implementations/registry.js";
import { SqlJobRepository } from "./storage/sql/job-repository.js";
import { SqlRunRepository } from "./storage/sql/run-repository.js";
import { CatalogLoader } from "./definitions/loader.js";
import { MigrationRunner } from "./migrations/runner.js";
import { DslService } from "./services/dsl-service.js";
import { AnalyticsService } from "./services/analytics-service.js";
import { MetricsRegistry } from "./metrics/registry.js";
import { MetricsCollector } from "./metrics/collector.js";
import { InMemoryAuditSink } from "./audit/memory-sink.js";
import { AuditTrail } from "./audit/trail.js";
import { WebhookDispatcher } from "./webhooks/dispatcher.js";
import { WebhookDeliveryStore } from "./webhooks/delivery-store.js";
import { ApiKeyStore, ApiKeyAuthenticator } from "./security/auth.js";
import { BatchCoordinator } from "./batch/coordinator.js";
import { TemplateInstantiator } from "./templates/instantiator.js";
import { RunReplayer } from "./replay/replayer.js";
import { RunQueryService } from "./query/run-query-service.js";
import { JobBundleImporter } from "./import/job-bundle-importer.js";
import { NotificationService } from "./notifications/service.js";
import { EmailNotificationChannel } from "./notifications/email-channel.js";
import { RecoveryService } from "./persistence/recovery-service.js";
import { CheckpointStore } from "./persistence/checkpoint-store.js";
import { HttpHandlerInvoker } from "./handlers/http/invoker.js";
import { PluginLoader } from "./plugins/loader.js";
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
  batchService: BatchService;
  handlerRegistry: HandlerRegistry;
  metricsRegistry: MetricsRegistry;
  eventBus: EventBus;
  apiKeyAuth: ApiKeyAuthenticator;
  deadLetterStore: InMemoryDeadLetterStore;
  webhookDeliveries: WebhookDeliveryStore;
  workerPool: WorkerPool;
  cronTicker: CronTicker;
  runLocks: RunLockRegistry;
  batchCoordinator: BatchCoordinator;
  templateInstantiator: TemplateInstantiator;
  runReplayer: RunReplayer;
  runQueryService: RunQueryService;
  jobImporter: JobBundleImporter;
  notificationService: NotificationService;
  recoveryService: RecoveryService;
  httpInvoker: HttpHandlerInvoker;
  pluginLoader: PluginLoader;
  catalogLoader: CatalogLoader;
  dslService: DslService;
  analyticsService: AnalyticsService;
  migrationRunner: MigrationRunner;
  handlerImplementations: HandlerImplementationRegistry;
}

export function createContainer(config?: EngineConfig): AppContainer {
  const resolved = config ?? loadConfigSync();
  const clock = new SystemClock();
  const log = createLogger(resolved);

  const jobStore = new SqlJobRepository(new InMemoryJobStore());
  const workflowStore = new InMemoryWorkflowStore();
  const runStore = new SqlRunRepository(new InMemoryRunStore());
  const deadLetterStore = new InMemoryDeadLetterStore();
  const scheduleStore = new InMemoryScheduleStore();
  const webhookStore = new InMemoryWebhookStore();
  const webhookDeliveries = new WebhookDeliveryStore();
  const metricsRegistry = new MetricsRegistry();
  const eventBus = new EventBus();
  const runLocks = new RunLockRegistry();
  const workerPool = new WorkerPool(resolved.workerConcurrency);

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
  const handlerImplementations = new HandlerImplementationRegistry();

  const taskExecutor = new TaskExecutor(
    new TaskSimulator(resolved, handlerImplementations),
    new RetryHandler(clock),
    clock,
    log.child({ component: "executor" }),
  );

  const auditService = new AuditService(new AuditTrail(new InMemoryAuditSink(), clock));
  const tenantService = new TenantService(jobStore, runStore);
  tenantService.register("tenant_dev" as TenantId, "development");

  const apiKeyAuth = new ApiKeyAuthenticator(new ApiKeyStore());

  const webhookService = new WebhookService(
    webhookStore,
    new WebhookDispatcher(log.child({ component: "webhooks" }), clock),
    webhookDeliveries,
  );

  const notificationService = new NotificationService([
    new EmailNotificationChannel(
      { from: "jobflow@internal", smtpHost: "smtp.internal", enabled: true },
      log.child({ component: "email" }),
    ),
  ]);

  eventBus.subscribe((e) => {
    if (e.type === "run.failed") {
      void webhookService.emit("tenant_dev" as TenantId, "run.failed", { runId: e.runId });
      void notificationService.notifyRunFailure(e.runId, "workflow", e.reason);
    }
    if (e.type === "run.completed") {
      void webhookService.emit("tenant_dev" as TenantId, "run.completed", { runId: e.runId });
    }
  });

  const jobService = new JobService(jobStore, clock, log.child({ component: "jobs" }), handlerRegistry, handlerResolver);
  const workflowService = new WorkflowService(jobStore, workflowStore, runStore, clock);
  const catalogLoader = new CatalogLoader(jobStore, log.child({ component: "catalog" }));
  const dslService = new DslService(jobService);
  const analyticsService = new AnalyticsService(workflowService);
  const migrationRunner = new MigrationRunner(log.child({ component: "migrations" }));
  const scheduleService = new ScheduleService(scheduleStore, clock);
  const recoveryService = new RecoveryService(new CheckpointStore(), workflowStore, clock, log);

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

  const batchCoordinator = new BatchCoordinator(
    workflowService,
    executionService,
    workerPool,
    log.child({ component: "batch" }),
    clock,
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
    batchService: new BatchService(batchCoordinator),
    handlerRegistry,
    metricsRegistry,
    eventBus,
    apiKeyAuth,
    deadLetterStore,
    webhookDeliveries,
    workerPool,
    cronTicker,
    runLocks,
    batchCoordinator,
    templateInstantiator: new TemplateInstantiator(clock),
    runReplayer: new RunReplayer(workflowService, executionService, workflowStore, log),
    runQueryService: new RunQueryService(runStore),
    jobImporter: new JobBundleImporter(jobService, log),
    notificationService,
    recoveryService,
    httpInvoker: new HttpHandlerInvoker(log.child({ component: "http-handlers" })),
    pluginLoader: new PluginLoader(),
    catalogLoader,
    dslService,
    analyticsService,
    migrationRunner,
    handlerImplementations,
  };
}
