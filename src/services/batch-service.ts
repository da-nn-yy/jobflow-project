import type { BatchCoordinator } from "../batch/coordinator.js";
import type { BatchManifest } from "../batch/manifest.js";

export class BatchService {
  constructor(private readonly coordinator: BatchCoordinator) {}

  execute(manifest: BatchManifest) {
    return this.coordinator.execute(manifest);
  }

  progress(manifestId: string) {
    return this.coordinator.getProgress(manifestId);
  }
}
