import { describe, expect, it, beforeEach, afterEach } from "vitest";
import type { FastifyInstance } from "fastify";
import type { AppContainer } from "../src/container.js";
import { createContainer } from "../src/container.js";
import { buildApp } from "../src/api/server.js";

describe("HTTP API", () => {
  let container: AppContainer;
  let app: FastifyInstance;

  beforeEach(() => {
    process.env.JOBFLOW_AUTH_DISABLED = "1";
    container = createContainer();
    app = buildApp(container);
  });

  afterEach(async () => {
    await app.close();
  });

  it("GET /health returns ok", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("GET /openapi.json returns spec", async () => {
    const res = await app.inject({ method: "GET", url: "/openapi.json" });
    expect(res.statusCode).toBe(200);
    expect(res.json().openapi).toMatch(/^3\./);
  });

  it("POST /api/v1/dsl/compile registers job from DSL", async () => {
    const source = `
workflow api_test: {
  version: 1
  task only: {
    handler: "invoice.fetch"
    timeout: 5000
  }
}`;
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/dsl/compile",
      payload: { source, jobId: "api_dsl_test" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().job.id).toBe("api_dsl_test");
  });

  it("lists jobs after catalog seed path", async () => {
    await container.catalogLoader.seedIfEmpty();
    const res = await app.inject({ method: "GET", url: "/jobs" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { jobs: unknown[] };
    expect(Array.isArray(body.jobs)).toBe(true);
    expect(body.jobs.length).toBeGreaterThan(0);
  });
});
