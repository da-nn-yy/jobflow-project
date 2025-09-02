export type TenantId = string & { readonly __brand: "TenantId" };

export interface TenantContext {
  tenantId: TenantId;
  environment: "development" | "staging" | "production";
  quotas: TenantQuotas;
}

export interface TenantQuotas {
  maxConcurrentRuns: number;
  maxJobs: number;
  maxWebhookEndpoints: number;
}

export const DEFAULT_QUOTAS: TenantQuotas = {
  maxConcurrentRuns: 50,
  maxJobs: 200,
  maxWebhookEndpoints: 10,
};
