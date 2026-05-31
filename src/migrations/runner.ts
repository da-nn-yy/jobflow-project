import type { Migration } from "./types.js";
import { migration001 } from "./versions/001_initial.js";
import { migration002 } from "./versions/002_audit.js";
import { migration003 } from "./versions/003_webhooks.js";
import type { Logger } from "../utils/logger.js";

const ALL: Migration[] = [migration001, migration002, migration003];

export class MigrationRunner {
  private applied = new Set<number>();

  constructor(private readonly log: Logger) {}

  async migrate(target?: number): Promise<number> {
    const sorted = [...ALL].sort((a, b) => a.version - b.version);
    let count = 0;
    for (const m of sorted) {
      if (target !== undefined && m.version > target) break;
      if (this.applied.has(m.version)) continue;
      await m.up();
      this.applied.add(m.version);
      this.log.info("migration applied", { version: m.version, name: m.name });
      count += 1;
    }
    return count;
  }

  currentVersion(): number {
    return Math.max(0, ...this.applied);
  }
}
