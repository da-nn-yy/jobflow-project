import { z } from "zod";

export const retryPolicySchema = z.object({
  maxAttempts: z.number().int().min(1).max(20),
  initialDelayMs: z.number().int().min(0),
  backoffMultiplier: z.number().min(1),
  maxDelayMs: z.number().int().min(0),
});

export const engineConfigSchema = z.object({
  port: z.number().int().min(1).max(65535).default(4100),
  workerConcurrency: z.number().int().min(1).max(64).default(4),
  defaultTaskTimeoutMs: z.number().int().min(100).default(30_000),
  defaultRetryPolicy: retryPolicySchema,
  transitionRulesPath: z.string().optional(),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  simulateLatencyMs: z.object({
    min: z.number().int().min(0),
    max: z.number().int().min(0),
  }),
  failRatePercent: z.number().min(0).max(100).default(0),
});

export const jobDefinitionInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.number().int().positive(),
  description: z.string().optional(),
  tasks: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        handler: z.string().min(1),
        timeoutMs: z.number().int().positive(),
        optional: z.boolean().optional(),
        dependsOn: z.array(z.string()).optional(),
      }),
    )
    .min(1),
  constraints: z
    .array(
      z.object({
        id: z.string(),
        expression: z.string(),
        severity: z.enum(["warn", "block"]),
      }),
    )
    .default([]),
  retryPolicy: retryPolicySchema.optional(),
  allowedTransitions: z.array(z.string()).default([]),
  metadata: z.record(z.string()).default({}),
});
