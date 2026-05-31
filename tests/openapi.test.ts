import { describe, expect, it } from "vitest";
import { OPENAPI_SPEC, openApiJson } from "../src/openapi/spec.js";
import { ALL_SCHEMAS } from "../src/openapi/schemas.js";

describe("OpenAPI", () => {
  it("exports valid OpenAPI document", () => {
    expect(OPENAPI_SPEC.openapi).toMatch(/^3\./);
    expect(OPENAPI_SPEC.paths["/health"]).toBeDefined();
    expect(OPENAPI_SPEC.paths["/jobs"]).toBeDefined();
    const json = JSON.parse(openApiJson());
    expect(json.info.title).toBe("Jobflow Engine API");
  });

  it("includes component schemas", () => {
    expect(ALL_SCHEMAS.JobDefinition).toBeDefined();
    expect(ALL_SCHEMAS.WorkflowInstance).toBeDefined();
  });
});
