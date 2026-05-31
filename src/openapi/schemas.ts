export const JOB_DEFINITION_SCHEMA = {
  type: "object",
  required: ["id", "name", "version", "tasks"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    version: { type: "integer", minimum: 1 },
    description: { type: "string" },
    tasks: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name", "handler", "timeoutMs"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          handler: { type: "string" },
          timeoutMs: { type: "integer" },
          optional: { type: "boolean" },
          dependsOn: { type: "array", items: { type: "string" } },
        },
      },
    },
    constraints: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          expression: { type: "string" },
          severity: { type: "string", enum: ["warn", "block"] },
        },
      },
    },
    retryPolicy: {
      type: "object",
      properties: {
        maxAttempts: { type: "integer" },
        initialDelayMs: { type: "integer" },
        backoffMultiplier: { type: "number" },
        maxDelayMs: { type: "integer" },
      },
    },
    metadata: { type: "object", additionalProperties: { type: "string" } },
  },
};

export const WORKFLOW_INSTANCE_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string" },
    jobId: { type: "string" },
    runId: { type: "string" },
    state: {
      type: "string",
      enum: ["draft", "pending", "running", "waiting", "completed", "failed", "cancelled", "dead_lettered"],
    },
    tasks: { type: "array" },
    history: { type: "array" },
    version: { type: "integer" },
  },
};

export const ERROR_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    error: { type: "string" },
    code: { type: "string" },
  },
};

export const ALL_SCHEMAS = {
  JobDefinition: JOB_DEFINITION_SCHEMA,
  WorkflowInstance: WORKFLOW_INSTANCE_SCHEMA,
  ErrorResponse: ERROR_RESPONSE_SCHEMA,
};
