import type { JobDefinition } from "../domain/job-definition.js";
import type { JobId } from "../domain/types.js";
import { NotFoundError } from "../domain/errors.js";
import type { JobDefinitionStore } from "../storage/interfaces.js";
import { JobDefinitionValidator } from "../validators/job-definition-validator.js";
import { jobDefinitionInputSchema } from "../config/schema.js";
import { asJobId, newJobId } from "../utils/ids.js";
import type { Clock } from "../utils/clock.js";
import { DEFAULT_RETRY_POLICY } from "../domain/retry-policy.js";
import type { Logger } from "../utils/logger.js";

export class JobService {
  private readonly validator = new JobDefinitionValidator();

  constructor(
    private readonly store: JobDefinitionStore,
    private readonly clock: Clock,
    private readonly log: Logger,
  ) {}

  async register(input: unknown): Promise<JobDefinition> {
    const parsed = jobDefinitionInputSchema.parse(input);
    const id = parsed.id ? asJobId(parsed.id) : newJobId();
    const now = this.clock.nowIso();

    const definition: JobDefinition = {
      id,
      name: parsed.name,
      version: parsed.version,
      description: parsed.description,
      tasks: parsed.tasks,
      constraints: parsed.constraints,
      retryPolicy: parsed.retryPolicy ?? DEFAULT_RETRY_POLICY,
      allowedTransitions: parsed.allowedTransitions,
      metadata: parsed.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.validator.validate(definition);
    this.validator.validateDependencyOrder(definition.tasks);
    await this.store.save(definition);
    this.log.info("job registered", { jobId: id, name: definition.name });
    return definition;
  }

  async get(id: JobId): Promise<JobDefinition> {
    const def = await this.store.get(id);
    if (!def) throw new NotFoundError("JobDefinition", id);
    return def;
  }

  async list(): Promise<JobDefinition[]> {
    return this.store.list();
  }
}
