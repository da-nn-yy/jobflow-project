import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { JobService } from "../services/job-service.js";
import type { Logger } from "../utils/logger.js";

export interface ImportResult {
  imported: string[];
  failed: Array<{ file: string; error: string }>;
}

export class JobBundleImporter {
  constructor(
    private readonly jobs: JobService,
    private readonly log: Logger,
  ) {}

  async importDirectory(dir: string): Promise<ImportResult> {
    const abs = resolve(dir);
    const files = await readdir(abs);
    const result: ImportResult = { imported: [], failed: [] };

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const path = join(abs, file);
      try {
        const raw = JSON.parse(await readFile(path, "utf8")) as unknown;
        const def = await this.jobs.register(raw);
        result.imported.push(def.id);
        this.log.info("imported job definition", { file, jobId: def.id });
      } catch (err) {
        result.failed.push({ file, error: String(err) });
      }
    }
    return result;
  }
}
