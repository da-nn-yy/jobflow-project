import type { JobDefinition } from "../../domain/job-definition.js";
import type { JobId } from "../../domain/types.js";
import type { JobDefinitionStore } from "../interfaces.js";

export class InMemoryJobStore implements JobDefinitionStore {
  private readonly byId = new Map<JobId, JobDefinition>();

  async save(definition: JobDefinition): Promise<void> {
    this.byId.set(definition.id, definition);
  }

  async get(id: JobId): Promise<JobDefinition | undefined> {
    return this.byId.get(id);
  }

  async list(): Promise<JobDefinition[]> {
    return [...this.byId.values()];
  }

  async delete(id: JobId): Promise<boolean> {
    return this.byId.delete(id);
  }
}
