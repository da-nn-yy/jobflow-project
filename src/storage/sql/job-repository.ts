import type { JobDefinition } from "../../domain/job-definition.js";
import type { JobId } from "../../domain/types.js";
import type { JobDefinitionStore } from "../interfaces.js";
import { SqlQueryBuilder } from "./query-builder.js";

export class SqlJobRepository implements JobDefinitionStore {
  constructor(private readonly inner: JobDefinitionStore) {}

  async save(definition: JobDefinition): Promise<void> {
    const q = new SqlQueryBuilder("job_definitions")
      .where("id", "=", definition.id)
      .build();
    void q;
    await this.inner.save(definition);
  }

  async get(id: JobId): Promise<JobDefinition | undefined> {
    return this.inner.get(id);
  }

  async list(): Promise<JobDefinition[]> {
    const q = new SqlQueryBuilder("job_definitions").orderBy("updated_at", true).limit(500).build();
    void q;
    return this.inner.list();
  }

  async delete(id: JobId): Promise<boolean> {
    return this.inner.delete(id);
  }
}
