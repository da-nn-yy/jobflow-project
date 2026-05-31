export const OPENAPI_SPEC = {
  openapi: "3.0.3",
  info: {
    title: "Jobflow Engine API",
    version: "2.0.0",
    description: "Enterprise job processing and workflow orchestration HTTP API",
  },
  servers: [{ url: "http://localhost:4100" }],
  paths: {
    "/health": {
      get: { summary: "Liveness probe", responses: { "200": { description: "OK" } } },
    },
    "/metrics": {
      get: { summary: "Prometheus metrics", responses: { "200": { description: "text/plain" } } },
    },
    "/jobs": {
      get: { summary: "List job definitions" },
      post: { summary: "Register job definition" },
    },
    "/jobs/{jobId}": {
      get: { summary: "Get job definition" },
    },
    "/jobs/{jobId}/runs": {
      post: { summary: "Start asynchronous run" },
    },
    "/runs/{runId}": {
      get: { summary: "Get workflow instance state" },
    },
    "/runs/{runId}/execute": {
      post: { summary: "Drive execution to completion" },
    },
    "/runs/{runId}/export.csv": {
      get: { summary: "Export run task grid as CSV" },
    },
    "/schedules": {
      get: { summary: "List cron schedules" },
      post: { summary: "Create schedule" },
    },
    "/webhooks": {
      post: { summary: "Register webhook endpoint" },
    },
    "/v2/templates": {
      get: { summary: "List workflow templates" },
    },
    "/v2/templates/{id}/instantiate": {
      post: { summary: "Instantiate template as job" },
    },
    "/v2/batch": {
      post: { summary: "Execute batch manifest" },
    },
    "/admin/dead-letter": {
      get: { summary: "List dead letter queue" },
    },
    "/admin/audit": {
      get: { summary: "Query audit trail" },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "API key" },
    },
  },
} as const;

export function openApiJson(): string {
  return JSON.stringify(OPENAPI_SPEC, null, 2);
}
