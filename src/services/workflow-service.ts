import type { JobDefinition } from "../domain/job-definition.js";
import type { JobRun, WorkflowInstance } from "../domain/workflow-instance.js";
import { WorkflowState } from "../domain/types.js";
import type { JobId, RunId } from "../domain/types.js";
import type { JobDefinitionStore, WorkflowStore, RunStore } from "../storage/interfaces.js";
import { newRunId, newTaskId, newWorkflowId } from "../utils/ids.js";
import { createTaskRun } from "../domain/task.js";
import type { Clock } from "../utils/clock.js";
import { NotFoundError } from "../domain/errors.js";

export class WorkflowService {
  constructor(
    private readonly jobStore: JobDefinitionStore,
    private readonly workflowStore: WorkflowStore,
    private readonly runStore: RunStore,
    private readonly clock: Clock,
  ) {}

  async createRun(
    jobId: JobId,
    trigger: string,
    input: Record<string, unknown> = {},
  ): Promise<{ run: JobRun; workflow: WorkflowInstance; definition: JobDefinition }> {
    const definition = await this.jobStore.get(jobId);
    if (!definition) throw new NotFoundError("JobDefinition", jobId);

    const runId = newRunId();
    const workflowId = newWorkflowId();
    const now = this.clock.nowIso();

    const tasks = definition.tasks.map((t) =>
      createTaskRun(newTaskId(), runId, t.id, t.handler),
    );

    const workflow: WorkflowInstance = {
      id: workflowId,
      jobId,
      runId,
      state: WorkflowState.Pending,
      context: { ...input },
      tasks,
      history: [],
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    const run: JobRun = {
      id: runId,
      jobId,
      workflowId,
      status: WorkflowState.Pending,
      startedAt: now,
      trigger,
      input,
    };

    await this.workflowStore.save(workflow);
    await this.runStore.save(run);

    return { run, workflow, definition };
  }

  async getWorkflowByRun(runId: RunId): Promise<WorkflowInstance> {
    const wf = await this.workflowStore.getByRunId(runId);
    if (!wf) throw new NotFoundError("WorkflowInstance", runId);
    return wf;
  }
}
