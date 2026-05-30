import type { InMemoryJobStore } from "../storage/memory/job-store.js";
import type { InMemoryRunStore } from "../storage/memory/run-store.js";

export interface HealthCheckResult {
  status: "ok" | "degraded" | "down";
  checks: Record<string, { ok: boolean; latencyMs: number; detail?: string }>;
}

export class DependencyHealthCheck {
  constructor(
    private readonly jobs: InMemoryJobStore,
    private readonly runs: InMemoryRunStore,
  ) {}

  async run(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult["checks"] = {};
    checks.storage_jobs = await this.timed(async () => {
      await this.jobs.list();
      return true;
    });
    checks.storage_runs = await this.timed(async () => {
      await this.runs.listActive();
      return true;
    });
    checks.clock = { ok: true, latencyMs: 0 };

    const ok = Object.values(checks).every((c) => c.ok);
    return { status: ok ? "ok" : "degraded", checks };
  }

  private async timed(fn: () => Promise<boolean>): Promise<{ ok: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      const ok = await fn();
      return { ok, latencyMs: Date.now() - start };
    } catch {
      return { ok: false, latencyMs: Date.now() - start };
    }
  }
}
