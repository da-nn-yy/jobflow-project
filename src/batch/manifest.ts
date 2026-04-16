import type { JobId } from "../domain/types.js";
import type { RunPriority } from "../domain/priority.js";

export interface BatchJobItem {
  jobId: JobId;
  label: string;
  input: Record<string, unknown>;
  priority?: RunPriority;
  continueOnError?: boolean;
}

export interface BatchManifest {
  id: string;
  name: string;
  tenantId: string;
  items: BatchJobItem[];
  maxParallel?: number;
  createdAt: string;
}

export interface BatchProgress {
  manifestId: string;
  total: number;
  completed: number;
  failed: number;
  running: number;
  runIds: string[];
}
