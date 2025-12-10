import type { TenantContext, TenantId } from "../domain/tenant.js";
import { DEFAULT_QUOTAS } from "../domain/tenant.js";
import { InMemoryRunStore } from "../storage/memory/run-store.js";
import type { JobDefinitionStore } from "../storage/interfaces.js";
import { JobflowError } from "../domain/errors.js";

export class TenantService {
  private readonly tenants = new Map<TenantId, TenantContext>();

  constructor(
    private readonly jobStore: JobDefinitionStore,
    private readonly runStore: InMemoryRunStore,
  ) {}

  register(tenantId: TenantId, environment: TenantContext["environment"]): TenantContext {
    const ctx: TenantContext = {
      tenantId,
      environment,
      quotas: { ...DEFAULT_QUOTAS },
    };
    this.tenants.set(tenantId, ctx);
    return ctx;
  }

  get(tenantId: TenantId): TenantContext | undefined {
    return this.tenants.get(tenantId);
  }

  async assertCanStartRun(tenantId: TenantId): Promise<void> {
    const ctx = this.tenants.get(tenantId);
    if (!ctx) return;
    const active = await this.runStore.listActive();
    const tenantActive = active.length; // simplified: global cap when multi-tenant tagging on runs matures
    if (tenantActive >= ctx.quotas.maxConcurrentRuns) {
      throw new JobflowError("QUOTA_EXCEEDED", "max concurrent runs exceeded");
    }
  }

  async assertCanRegisterJob(tenantId: TenantId): Promise<void> {
    const ctx = this.tenants.get(tenantId);
    if (!ctx) return;
    const jobs = await this.jobStore.list();
    if (jobs.length >= ctx.quotas.maxJobs) {
      throw new JobflowError("QUOTA_EXCEEDED", "max jobs exceeded for tenant");
    }
  }
}
