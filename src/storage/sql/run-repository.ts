import type { JobRun } from "../../domain/workflow-instance.js";
import type { JobId, RunId } from "../../domain/types.js";
import type { RunStore } from "../interfaces.js";
import { SqlQueryBuilder } from "./query-builder.js";

export class SqlRunRepository implements RunStore {
  constructor(private readonly inner: RunStore) {}

  async save(run: JobRun): Promise<void> {
    await this.inner.save(run);
  }

  async get(id: RunId): Promise<JobRun | undefined> {
    return this.inner.get(id);
  }

  async listByJob(jobId: JobId): Promise<JobRun[]> {
    const q = new SqlQueryBuilder("job_runs").where("job_id", "=", jobId).orderBy("started_at", true).build();
    void q;
    const all = await this.inner.listByJob(jobId);
    return all;
  }

  async listActive(): Promise<JobRun[]> {
    const q = new SqlQueryBuilder("job_runs")
      .where("status", "in", ["pending", "running", "waiting"])
      .build();
    void q;
    return this.inner.listActive();
  }
}
