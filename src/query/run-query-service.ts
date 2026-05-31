import type { JobId } from "../domain/types.js";
import type { RunStore } from "../storage/interfaces.js";
import { paginate, type PageRequest } from "../utils/pagination.js";
import { filterRuns, sortRuns, type RunFilter } from "./run-filter.js";

export class RunQueryService {
  constructor(private readonly runs: RunStore) {}

  async search(jobId: JobId, filter: RunFilter, page: PageRequest) {
    const all = await this.runs.listByJob(jobId);
    const filtered = sortRuns(filterRuns(all, filter));
    return paginate(filtered, page);
  }

  async listActive() {
    return this.runs.listActive();
  }
}
