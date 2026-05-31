import type { JobDefinitionStore } from "../storage/interfaces.js";
import { FULL_CATALOG } from "./catalog-extended.js";
import { ENTERPRISE_JOB_PACK } from "./jobs/index.js";
import type { Logger } from "../utils/logger.js";

export class CatalogLoader {
  constructor(
    private readonly store: JobDefinitionStore,
    private readonly log: Logger,
  ) {}

  async seedIfEmpty(): Promise<number> {
    const existing = await this.store.list();
    if (existing.length > 0) return 0;
    const catalog = [...FULL_CATALOG, ...ENTERPRISE_JOB_PACK];
    for (const def of catalog) {
      await this.store.save(def);
    }
    this.log.info("seeded standard job catalog", { count: catalog.length });
    return catalog.length;
  }

  async reload(): Promise<void> {
    for (const def of FULL_CATALOG) {
      await this.store.save({ ...def, updatedAt: new Date().toISOString() });
    }
  }
}
