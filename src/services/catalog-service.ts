import type { JobDefinitionStore } from "../storage/interfaces.js";
import type { JobDefinition } from "../domain/job-definition.js";
import { FULL_CATALOG } from "../definitions/catalog-extended.js";
import { ENTERPRISE_JOB_PACK } from "../definitions/jobs/index.js";
import type { JobId } from "../domain/types.js";
import { NotFoundError } from "../domain/errors.js";

export class CatalogService {
  private readonly all = [...FULL_CATALOG, ...ENTERPRISE_JOB_PACK];

  constructor(private readonly store: JobDefinitionStore) {}

  listBuiltin(): JobDefinition[] {
    return this.all;
  }

  async syncBuiltin(): Promise<number> {
    for (const def of this.all) {
      await this.store.save(def);
    }
    return this.all.length;
  }

  async get(id: JobId): Promise<JobDefinition> {
    const fromStore = await this.store.get(id);
    if (fromStore) return fromStore;
    const builtin = this.all.find((j) => j.id === id);
    if (!builtin) throw new NotFoundError("JobDefinition", id);
    return builtin;
  }

  search(query: string): JobDefinition[] {
    const q = query.toLowerCase();
    return this.all.filter(
      (j) =>
        j.name.toLowerCase().includes(q) ||
        j.id.toLowerCase().includes(q) ||
        Object.values(j.metadata ?? {}).some((v) => v.toLowerCase().includes(q)),
    );
  }
}
