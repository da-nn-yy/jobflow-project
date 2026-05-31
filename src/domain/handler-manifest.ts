export interface HandlerManifestEntry {
  name: string;
  version: string;
  description: string;
  timeoutMs: number;
  retryable: boolean;
  tags: string[];
}

export const BUILTIN_HANDLERS: HandlerManifestEntry[] = [
  { name: "invoice.fetch", version: "2.1", description: "Pull invoice batch from ERP", timeoutMs: 30000, retryable: true, tags: ["erp", "finance"] },
  { name: "invoice.normalize", version: "1.4", description: "Normalize line items", timeoutMs: 15000, retryable: true, tags: ["finance"] },
  { name: "invoice.post_gl", version: "1.0", description: "Post journal entries to GL", timeoutMs: 30000, retryable: true, tags: ["finance", "erp"] },
  { name: "reconcile.extract", version: "2.0", description: "Extract ledger transactions", timeoutMs: 90000, retryable: true, tags: ["finance"] },
  { name: "reconcile.match", version: "3.0", description: "Match PO to invoice lines", timeoutMs: 60000, retryable: true, tags: ["finance"] },
  { name: "onboard.validate", version: "1.0", description: "KYC validation gate", timeoutMs: 20000, retryable: false, tags: ["compliance"] },
  { name: "onboard.provision", version: "1.2", description: "Provision tenant resources", timeoutMs: 45000, retryable: true, tags: ["platform"] },
  { name: "external.risky_notify", version: "0.9", description: "Third-party notification", timeoutMs: 8000, retryable: true, tags: ["external"] },
  { name: "report.aggregate", version: "1.1", description: "Roll up metrics for BI export", timeoutMs: 120000, retryable: true, tags: ["analytics"] },
];
