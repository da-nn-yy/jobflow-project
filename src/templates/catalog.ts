import type { JobDefinition } from "../domain/job-definition.js";
import { DEFAULT_RETRY_POLICY } from "../domain/retry-policy.js";
import { asJobId } from "../utils/ids.js";

export interface WorkflowTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  parameters: Array<{ key: string; required: boolean; description: string }>;
  build: (params: Record<string, string>) => Omit<JobDefinition, "createdAt" | "updatedAt">;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "erp_invoice_sync",
    name: "ERP invoice synchronization",
    category: "finance",
    description: "Fetch, normalize, and post invoices from ERP export",
    parameters: [
      { key: "tenantId", required: true, description: "Tenant identifier" },
      { key: "glAccount", required: false, description: "Target GL account" },
    ],
    build: (params) => ({
      id: asJobId(`invoice_sync_${params.tenantId}`),
      name: "ERP invoice sync",
      version: 1,
      tasks: [
        { id: "fetch", name: "Fetch", handler: "invoice.fetch", timeoutMs: 30000 },
        { id: "normalize", name: "Normalize", handler: "invoice.normalize", timeoutMs: 15000, dependsOn: ["fetch"] },
        { id: "post", name: "Post GL", handler: "invoice.post_gl", timeoutMs: 20000, dependsOn: ["normalize"] },
      ],
      constraints: [{ id: "tenant", expression: 'ctx.tenantId != ""', severity: "block" }],
      retryPolicy: DEFAULT_RETRY_POLICY,
      allowedTransitions: [],
      metadata: { glAccount: params.glAccount ?? "default" },
    }),
  },
  {
    id: "customer_onboarding",
    name: "Customer onboarding",
    category: "platform",
    description: "Validate and provision a new customer tenant",
    parameters: [{ key: "customerId", required: true, description: "Customer id" }],
    build: (params) => ({
      id: asJobId(`onboard_${params.customerId}`),
      name: "Customer onboarding",
      version: 1,
      tasks: [
        { id: "validate", name: "Validate", handler: "onboard.validate", timeoutMs: 20000 },
        { id: "provision", name: "Provision", handler: "onboard.provision", timeoutMs: 45000, dependsOn: ["validate"] },
      ],
      constraints: [],
      retryPolicy: DEFAULT_RETRY_POLICY,
      allowedTransitions: [],
      metadata: { customerId: params.customerId },
    }),
  },
  {
    id: "nightly_reconcile",
    name: "Nightly reconciliation",
    category: "finance",
    description: "Extract ledger data and match transactions",
    parameters: [{ key: "ledger", required: true, description: "Ledger code" }],
    build: (params) => ({
      id: asJobId(`reconcile_${params.ledger}`),
      name: "Nightly reconcile",
      version: 1,
      tasks: [
        { id: "extract", name: "Extract", handler: "reconcile.extract", timeoutMs: 120000 },
        { id: "match", name: "Match", handler: "reconcile.match", timeoutMs: 180000, dependsOn: ["extract"] },
        { id: "report", name: "Report", handler: "report.aggregate", timeoutMs: 60000, dependsOn: ["match"] },
      ],
      constraints: [],
      retryPolicy: { ...DEFAULT_RETRY_POLICY, maxAttempts: 2 },
      allowedTransitions: [],
      metadata: { ledger: params.ledger },
    }),
  },
];

export function getTemplate(id: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find((t) => t.id === id);
}
