import { WorkflowDslCompiler } from "../dsl/compiler.js";
import type { JobService } from "./job-service.js";
import type { JobDefinition } from "../domain/job-definition.js";

export class DslService {
  private readonly compiler = new WorkflowDslCompiler();

  compileAndRegister(source: string, jobId?: string): Promise<JobDefinition> {
    const def = this.compiler.compile(source, jobId);
    return this.jobs.register(def);
  }

  constructor(private readonly jobs: JobService) {}
}
