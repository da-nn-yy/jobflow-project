import type { WorkflowInstance } from "../domain/workflow-instance.js";
import type { JobRun } from "../domain/workflow-instance.js";

export interface SerializedRunBundle {
  version: number;
  run: JobRun;
  workflow: WorkflowInstance;
  exportedAt: string;
}

export class RunSerializer {
  serialize(run: JobRun, workflow: WorkflowInstance): string {
    const bundle: SerializedRunBundle = {
      version: 1,
      run,
      workflow,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(bundle, null, 2);
  }

  deserialize(raw: string): SerializedRunBundle {
    const parsed = JSON.parse(raw) as SerializedRunBundle;
    if (parsed.version !== 1) throw new Error(`unsupported bundle version ${parsed.version}`);
    return parsed;
  }

  redact(bundle: SerializedRunBundle, keys: string[]): SerializedRunBundle {
    const clone = structuredClone(bundle);
    for (const key of keys) {
      if (key in clone.workflow.context) delete clone.workflow.context[key];
      if (key in clone.run.input) delete clone.run.input[key];
    }
    return clone;
  }
}
