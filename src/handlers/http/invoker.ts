import { CircuitBreaker } from "./circuit-breaker.js";
import type { Logger } from "../../utils/logger.js";

export interface HttpInvokeRequest {
  url: string;
  method: "GET" | "POST";
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  timeoutMs: number;
}

export interface HttpInvokeResult {
  ok: boolean;
  status: number;
  body: unknown;
  latencyMs: number;
}

export class HttpHandlerInvoker {
  private readonly breakers = new Map<string, CircuitBreaker>();

  constructor(
    private readonly log: Logger,
    private readonly defaultBreakerThreshold = 5,
    private readonly defaultCooldownMs = 30_000,
  ) {}

  async invoke(handler: string, req: HttpInvokeRequest): Promise<HttpInvokeResult> {
    const breaker = this.getBreaker(handler);
    if (!breaker.canExecute()) {
      this.log.warn("circuit open, skipping handler", { handler });
      return { ok: false, status: 503, body: { error: "circuit_open" }, latencyMs: 0 };
    }

    const started = Date.now();
    try {
      const res = await fetch(req.url, {
        method: req.method,
        headers: { "content-type": "application/json", ...req.headers },
        body: req.body ? JSON.stringify(req.body) : undefined,
        signal: AbortSignal.timeout(req.timeoutMs),
      });
      const latencyMs = Date.now() - started;
      const text = await res.text();
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch {
        /* plain text */
      }
      if (res.ok) {
        breaker.recordSuccess();
      } else {
        breaker.recordFailure();
      }
      return { ok: res.ok, status: res.status, body, latencyMs };
    } catch (err) {
      breaker.recordFailure();
      return { ok: false, status: 0, body: { error: String(err) }, latencyMs: Date.now() - started };
    }
  }

  private getBreaker(handler: string): CircuitBreaker {
    let b = this.breakers.get(handler);
    if (!b) {
      b = new CircuitBreaker(this.defaultBreakerThreshold, this.defaultCooldownMs);
      this.breakers.set(handler, b);
    }
    return b;
  }
}
