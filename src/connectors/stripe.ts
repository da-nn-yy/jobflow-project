import { BaseConnector, type ConnectorConfig } from "./base-connector.js";
import type { Logger } from "../utils/logger.js";

export interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerId?: string;
}

export class StripeConnector extends BaseConnector {
  constructor(config: ConnectorConfig, log: Logger) {
    super(config, log.child({ connector: "stripe" }));
  }

  async healthCheck(): Promise<boolean> {
    const res = await this.request<{ object: string }>("GET", "/v1/balance");
    return res.ok;
  }

  async listCharges(sinceUnix: number, limit = 100): Promise<StripeCharge[]> {
    const res = await this.request<{ data: StripeCharge[] }>(
      "GET",
      `/v1/charges?created[gte]=${sinceUnix}&limit=${limit}`,
    );
    return res.data?.data ?? [];
  }

  async createRefund(chargeId: string, amount?: number): Promise<{ id: string } | undefined> {
    const body: Record<string, unknown> = { charge: chargeId };
    if (amount !== undefined) body.amount = amount;
    const res = await this.request<{ id: string }>("POST", "/v1/refunds", body);
    return res.data;
  }

  async getCustomer(customerId: string) {
    return this.request<Record<string, unknown>>("GET", `/v1/customers/${customerId}`);
  }
}
