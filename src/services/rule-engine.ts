import type { JobDefinition } from "../domain/job-definition.js";
import { ConstraintValidator, type ConstraintContext } from "../validators/constraint-validator.js";
import type { Logger } from "../utils/logger.js";

export class RuleEngine {
  private readonly validator = new ConstraintValidator();

  constructor(private readonly log: Logger) {}

  apply(definition: JobDefinition, ctx: ConstraintContext): void {
    const { warnings } = this.validator.evaluate(definition.constraints, ctx);
    for (const w of warnings) {
      this.log.warn("constraint warning", { constraintId: w, jobId: definition.id });
    }
    this.validator.assertPassing(definition.constraints, ctx);
  }
}
