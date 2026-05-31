import type { JobDefinition } from "../domain/job-definition.js";
import { DEFAULT_RETRY_POLICY } from "../domain/retry-policy.js";
import { asJobId } from "../utils/ids.js";

function job(
  id: string,
  name: string,
  version: number,
  tasks: JobDefinition["tasks"],
  constraints: JobDefinition["constraints"] = [],
  metadata: Record<string, string> = {},
): JobDefinition {
  const now = "2026-01-01T00:00:00.000Z";
  return {
    id: asJobId(id),
    name,
    version,
    tasks,
    constraints,
    retryPolicy: DEFAULT_RETRY_POLICY,
    allowedTransitions: [],
    metadata,
    createdAt: now,
    updatedAt: now,
  };
}

export const STANDARD_JOB_CATALOG: JobDefinition[] = [
  job("invoice_fetch_daily", "Daily invoice fetch", 1, [
    { id: "pull", name: "Pull from ERP", handler: "invoice.fetch", timeoutMs: 45_000 },
    { id: "validate", name: "Validate schema", handler: "invoice.normalize", timeoutMs: 20_000, dependsOn: ["pull"] },
  ]),
  job("invoice_post_gl", "GL posting run", 2, [
    { id: "prepare", name: "Prepare entries", handler: "invoice.normalize", timeoutMs: 30_000 },
    { id: "post", name: "Post entries", handler: "invoice.post_gl", timeoutMs: 60_000, dependsOn: ["prepare"] },
    { id: "audit", name: "Audit trail", handler: "report.aggregate", timeoutMs: 15_000, dependsOn: ["post"] },
  ]),
  job("reconcile_us_ledger", "US ledger reconcile", 3, [
    { id: "extract", name: "Extract", handler: "reconcile.extract", timeoutMs: 120_000 },
    { id: "match", name: "Match", handler: "reconcile.match", timeoutMs: 180_000, dependsOn: ["extract"] },
    { id: "exceptions", name: "Flag exceptions", handler: "report.aggregate", timeoutMs: 30_000, dependsOn: ["match"] },
  ]),
  job("reconcile_eu_ledger", "EU ledger reconcile", 3, [
    { id: "extract", name: "Extract", handler: "reconcile.extract", timeoutMs: 120_000 },
    { id: "match", name: "Match", handler: "reconcile.match", timeoutMs: 180_000, dependsOn: ["extract"] },
  ]),
  job("onboard_enterprise", "Enterprise onboarding", 1, [
    { id: "kyc", name: "KYC", handler: "onboard.validate", timeoutMs: 25_000 },
    { id: "provision", name: "Provision", handler: "onboard.provision", timeoutMs: 90_000, dependsOn: ["kyc"] },
  ]),
  job("onboard_smb", "SMB onboarding", 1, [
    { id: "kyc", name: "KYC light", handler: "onboard.validate", timeoutMs: 15_000 },
    { id: "provision", name: "Provision", handler: "onboard.provision", timeoutMs: 45_000, dependsOn: ["kyc"] },
  ]),
  job("notify_ops_digest", "Ops digest notification", 1, [
    { id: "aggregate", name: "Aggregate", handler: "report.aggregate", timeoutMs: 60_000 },
    { id: "notify", name: "Notify", handler: "external.risky_notify", timeoutMs: 10_000, dependsOn: ["aggregate"], optional: true },
  ]),
  job("month_end_close", "Month end close", 4, [
    { id: "freeze", name: "Freeze subledgers", handler: "reconcile.extract", timeoutMs: 60_000 },
    { id: "reconcile", name: "Reconcile all", handler: "reconcile.match", timeoutMs: 240_000, dependsOn: ["freeze"] },
    { id: "report", name: "CFO report", handler: "report.aggregate", timeoutMs: 90_000, dependsOn: ["reconcile"] },
    { id: "publish", name: "Publish", handler: "invoice.post_gl", timeoutMs: 45_000, dependsOn: ["report"] },
  ]),
];

export function getCatalogJob(id: string): JobDefinition | undefined {
  return STANDARD_JOB_CATALOG.find((j) => j.id === id);
}

export function listCatalogJobs(): JobDefinition[] {
  return [...STANDARD_JOB_CATALOG];
}
