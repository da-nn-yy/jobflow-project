import type { Logger } from "../utils/logger.js";

export interface ConnectorConfig {
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface ConnectorResponse<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  latencyMs: number;
}

export abstract class BaseConnector {
  protected constructor(
    protected readonly config: ConnectorConfig,
    protected readonly log: Logger,
  ) {}

  protected async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<ConnectorResponse<T>> {
    const start = Date.now();
    const url = `${this.config.baseUrl.replace(/\/$/, "")}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs ?? 30_000);

    try {
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (this.config.apiKey) headers.authorization = `Bearer ${this.config.apiKey}`;

      const res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const latencyMs = Date.now() - start;
      const text = await res.text();
      let data: T | undefined;
      try {
        data = text ? (JSON.parse(text) as T) : undefined;
      } catch {
        data = undefined;
      }

      if (!res.ok) {
        this.log.warn("connector request failed", { url, status: res.status, latencyMs });
        return { ok: false, status: res.status, error: text || res.statusText, latencyMs };
      }

      return { ok: true, status: res.status, data, latencyMs };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const message = err instanceof Error ? err.message : String(err);
      this.log.error("connector request error", { url, message, latencyMs });
      return { ok: false, status: 0, error: message, latencyMs };
    } finally {
      clearTimeout(timeout);
    }
  }

  abstract healthCheck(): Promise<boolean>;
}
