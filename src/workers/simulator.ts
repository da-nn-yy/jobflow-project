import type { EngineConfig } from "../config/defaults.js";
import type { HandlerImplementationRegistry } from "../handlers/implementations/registry.js";
import type { HandlerContext } from "../handlers/implementations/base.js";

export interface SimulatedResult {
  success: boolean;
  output: Record<string, unknown>;
  latencyMs: number;
  errorMessage?: string;
}

export class TaskSimulator {
  constructor(
    private readonly config: EngineConfig,
    private readonly implementations?: HandlerImplementationRegistry,
  ) {}

  async execute(
    handler: string,
    input: Record<string, unknown>,
    execCtx?: HandlerContext,
  ): Promise<SimulatedResult> {
    const impl = this.implementations?.get(handler);
    if (impl && execCtx) {
      const started = Date.now();
      const result = await impl.execute(execCtx, {
        id: execCtx.taskId,
        name: handler,
        handler,
        timeoutMs: 30_000,
      });
      return {
        success: result.success,
        output: result.output,
        latencyMs: Date.now() - started,
        errorMessage: result.success ? undefined : String(result.output.error ?? "handler failed"),
      };
    }

    const latencyMs = this.randomLatency();
    await this.sleep(latencyMs);

    if (this.shouldFail(handler)) {
      return {
        success: false,
        output: {},
        latencyMs,
        errorMessage: `simulated failure for handler ${handler}`,
      };
    }

    return {
      success: true,
      output: this.buildOutput(handler, input),
      latencyMs,
    };
  }

  private randomLatency(): number {
    const { min, max } = this.config.simulateLatencyMs;
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  private shouldFail(handler: string): boolean {
    if (this.config.failRatePercent <= 0) return false;
    const roll = Math.random() * 100;
    if (roll >= this.config.failRatePercent) return false;
    return handler.includes("risky") || handler.includes("external");
  }

  private buildOutput(handler: string, input: Record<string, unknown>): Record<string, unknown> {
    return {
      handler,
      processedAt: new Date().toISOString(),
      inputKeys: Object.keys(input),
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
