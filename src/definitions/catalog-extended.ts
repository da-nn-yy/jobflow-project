import type { JobDefinition } from "../domain/job-definition.js";
import { asJobId } from "../utils/ids.js";
import { STANDARD_JOB_CATALOG } from "./catalog.js";
import { DEFAULT_RETRY_POLICY } from "../domain/retry-policy.js";

function ext(
  id: string,
  name: string,
  tasks: JobDefinition["tasks"],
): JobDefinition {
  const now = "2026-02-01T00:00:00.000Z";
  return {
    id: asJobId(id),
    name,
    version: 1,
    tasks,
    constraints: [],
    retryPolicy: DEFAULT_RETRY_POLICY,
    allowedTransitions: [],
    metadata: { tier: "extended" },
    createdAt: now,
    updatedAt: now,
  };
}

export const EXTENDED_JOB_CATALOG: JobDefinition[] = [
  ext("apac_invoice_sync", "APAC invoice sync", [
    { id: "fetch", name: "Fetch", handler: "invoice.fetch", timeoutMs: 40_000 },
    { id: "norm", name: "Normalize", handler: "invoice.normalize", timeoutMs: 20_000, dependsOn: ["fetch"] },
    { id: "post", name: "Post", handler: "invoice.post_gl", timeoutMs: 30_000, dependsOn: ["norm"] },
  ]),
  ext("latam_reconcile", "LATAM reconcile", [
    { id: "extract", name: "Extract", handler: "reconcile.extract", timeoutMs: 90_000 },
    { id: "match", name: "Match", handler: "reconcile.match", timeoutMs: 120_000, dependsOn: ["extract"] },
  ]),
  ext("vendor_onboarding", "Vendor onboarding", [
    { id: "validate", name: "Validate", handler: "onboard.validate", timeoutMs: 20_000 },
    { id: "provision", name: "Provision", handler: "onboard.provision", timeoutMs: 50_000, dependsOn: ["validate"] },
  ]),
  ext("treasury_daily", "Treasury daily", [
    { id: "extract", name: "Extract", handler: "reconcile.extract", timeoutMs: 60_000 },
    { id: "report", name: "Report", handler: "report.aggregate", timeoutMs: 45_000, dependsOn: ["extract"] },
  ]),
  ext("compliance_scan", "Compliance scan", [
    { id: "scan", name: "Scan", handler: "onboard.validate", timeoutMs: 30_000 },
    { id: "notify", name: "Notify", handler: "external.risky_notify", timeoutMs: 8_000, dependsOn: ["scan"], optional: true },
  ]),
  ext("intercompany_elim", "Intercompany elimination", [
    { id: "pull", name: "Pull IC", handler: "invoice.fetch", timeoutMs: 55_000 },
    { id: "match", name: "Match IC", handler: "reconcile.match", timeoutMs: 90_000, dependsOn: ["pull"] },
    { id: "post", name: "Eliminate", handler: "invoice.post_gl", timeoutMs: 40_000, dependsOn: ["match"] },
  ]),
  ext("tax_withholding", "Tax withholding", [
    { id: "calc", name: "Calculate", handler: "report.aggregate", timeoutMs: 35_000 },
    { id: "file", name: "File", handler: "invoice.post_gl", timeoutMs: 25_000, dependsOn: ["calc"] },
  ]),
  ext("payroll_accrual", "Payroll accrual", [
    { id: "accrue", name: "Accrue", handler: "invoice.normalize", timeoutMs: 40_000 },
    { id: "post", name: "Post payroll", handler: "invoice.post_gl", timeoutMs: 35_000, dependsOn: ["accrue"] },
  ]),
  ext("inventory_reconcile", "Inventory reconcile", [
    { id: "count", name: "Count", handler: "reconcile.extract", timeoutMs: 70_000 },
    { id: "adjust", name: "Adjust", handler: "reconcile.match", timeoutMs: 50_000, dependsOn: ["count"] },
  ]),
  ext("fixed_asset_depreciation", "Fixed asset depreciation", [
    { id: "depreciate", name: "Run depreciation", handler: "report.aggregate", timeoutMs: 80_000 },
    { id: "post", name: "Post JE", handler: "invoice.post_gl", timeoutMs: 30_000, dependsOn: ["depreciate"] },
  ]),
  ext("credit_memo_processing", "Credit memo processing", [
    { id: "fetch", name: "Fetch memos", handler: "invoice.fetch", timeoutMs: 25_000 },
    { id: "apply", name: "Apply", handler: "invoice.normalize", timeoutMs: 20_000, dependsOn: ["fetch"] },
  ]),
  ext("collections_escalation", "Collections escalation", [
    { id: "identify", name: "Identify overdue", handler: "reconcile.extract", timeoutMs: 30_000 },
    { id: "notify", name: "Escalate", handler: "external.risky_notify", timeoutMs: 10_000, dependsOn: ["identify"] },
  ]),
  ext("budget_variance", "Budget variance analysis", [
    { id: "load", name: "Load budget", handler: "invoice.fetch", timeoutMs: 20_000 },
    { id: "compare", name: "Compare actuals", handler: "reconcile.match", timeoutMs: 60_000, dependsOn: ["load"] },
    { id: "report", name: "Variance report", handler: "report.aggregate", timeoutMs: 40_000, dependsOn: ["compare"] },
  ]),
  ext("subsidiary_roll_up", "Subsidiary roll-up", [
    { id: "collect", name: "Collect subs", handler: "reconcile.extract", timeoutMs: 100_000 },
    { id: "consolidate", name: "Consolidate", handler: "report.aggregate", timeoutMs: 120_000, dependsOn: ["collect"] },
  ]),
];

export const FULL_CATALOG: JobDefinition[] = [...STANDARD_JOB_CATALOG, ...EXTENDED_JOB_CATALOG];
