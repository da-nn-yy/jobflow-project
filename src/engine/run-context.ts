import type { JobDefinition } from "../domain/job-definition.js";
import type { JobRun, WorkflowInstance } from "../domain/workflow-instance.js";
import type { RunId } from "../domain/types.js";

export interface RunContext {
  run: JobRun;
  definition: JobDefinition;
  workflow: WorkflowInstance;
}

export class RunContextFactory {
  build(run: JobRun, definition: JobDefinition, workflow: WorkflowInstance): RunContext {
    if (run.id !== workflow.runId) {
      throw new Error("run/workflow mismatch");
    }
    if (definition.id !== run.jobId) {
      throw new Error("run/job definition mismatch");
    }
    return { run, definition, workflow };
  }

  taskOutputs(ctx: RunContext): Record<string, Record<string, unknown>> {
    const out: Record<string, Record<string, unknown>> = {};
    for (const t of ctx.workflow.tasks) {
      if (t.output) {
        out[t.definitionTaskId] = t.output;
      }
    }
    return out;
  }

  getRunId(ctx: RunContext): RunId {
    return ctx.run.id;
  }
}
