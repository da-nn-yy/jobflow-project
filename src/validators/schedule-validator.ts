import { ValidationError } from "../domain/errors.js";

const FORBIDDEN = ["@", "rm ", "curl ", "wget "];

export class ScheduleValidator {
  validateCron(expression: string): void {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new ValidationError("cron must have 5 fields");
    }
    for (const token of FORBIDDEN) {
      if (expression.includes(token)) {
        throw new ValidationError("cron expression contains forbidden token");
      }
    }
  }
}
