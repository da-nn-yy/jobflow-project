import { describe, expect, it } from "vitest";
import { ScheduleValidator } from "../src/validators/schedule-validator.js";
import { ValidationError } from "../src/domain/errors.js";

describe("ScheduleValidator", () => {
  const validator = new ScheduleValidator();

  it("accepts valid 5-field cron", () => {
    expect(() => validator.validateCron("0 9 * * 1")).not.toThrow();
  });

  it("rejects cron with wrong field count", () => {
    expect(() => validator.validateCron("0 9 * *")).toThrow(ValidationError);
  });

  it("rejects forbidden tokens in expression", () => {
    expect(() => validator.validateCron("0 9 * * rm ")).toThrow(ValidationError);
    expect(() => validator.validateCron("@daily")).toThrow(ValidationError);
  });
});
