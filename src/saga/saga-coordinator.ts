import type { HandlerImplementationRegistry } from "../handlers/implementations/registry.js";
import type { HandlerContext } from "../handlers/implementations/base.js";
import type { SagaDefinition, SagaInstance } from "./saga-types.js";
import { CompensationStack } from "./compensation-stack.js";
import type { Clock } from "../utils/clock.js";
import type { Logger } from "../utils/logger.js";
import { newRunId } from "../utils/ids.js";
import type { RunId } from "../domain/types.js";

export class SagaCoordinator {
  private readonly instances = new Map<string, SagaInstance>();

  constructor(
    private readonly handlers: HandlerImplementationRegistry,
    private readonly clock: Clock,
    private readonly log: Logger,
  ) {}

  registerDefinition(def: SagaDefinition): void {
    this.definitions.set(def.id, def);
  }

  private readonly definitions = new Map<string, SagaDefinition>();

  async start(definitionId: string, input: Record<string, unknown> = {}): Promise<SagaInstance> {
    const def = this.definitions.get(definitionId);
    if (!def) throw new Error(`unknown saga definition: ${definitionId}`);

    const runId = newRunId() as RunId;
    const instance: SagaInstance = {
      id: `saga_${runId}`,
      runId,
      definitionId,
      status: "active",
      createdAt: this.clock.nowIso(),
      updatedAt: this.clock.nowIso(),
      steps: def.steps.map((s) => ({
        stepId: s.id,
        status: "pending",
        attempt: 0,
      })),
    };
    this.instances.set(instance.id, instance);
    return this.executeForward(instance, def, input);
  }

  async executeForward(
    instance: SagaInstance,
    def: SagaDefinition,
    input: Record<string, unknown>,
  ): Promise<SagaInstance> {
    const stack = new CompensationStack();
    const priorOutputs: Record<string, Record<string, unknown>> = {};

    for (let i = 0; i < def.steps.length; i++) {
      const stepDef = def.steps[i];
      const state = instance.steps[i];
      state.status = "running";
      state.attempt += 1;
      state.startedAt = this.clock.nowIso();

      const handler = this.handlers.get(stepDef.forward);
      if (!handler) {
        state.status = "failed";
        state.error = `no handler for ${stepDef.forward}`;
        instance.status = "failed";
        await this.compensate(instance, def, stack);
        return this.persist(instance);
      }

      const ctx: HandlerContext = {
        runId: instance.runId,
        taskId: stepDef.id,
        input,
        priorOutputs,
      };

      try {
        const result = await handler.execute(ctx, {
          id: stepDef.id,
          name: stepDef.name,
          handler: stepDef.forward,
          timeoutMs: stepDef.timeoutMs,
        });
        if (!result.success) {
          state.status = "failed";
          state.error = String(result.output?.error ?? "step failed");
          instance.status = "failed";
          await this.compensate(instance, def, stack);
          return this.persist(instance);
        }
        state.status = "completed";
        state.output = result.output;
        state.finishedAt = this.clock.nowIso();
        priorOutputs[stepDef.id] = result.output ?? {};
        stack.push(state);
      } catch (err) {
        state.status = "failed";
        state.error = err instanceof Error ? err.message : String(err);
        instance.status = "failed";
        await this.compensate(instance, def, stack);
        return this.persist(instance);
      }
    }

    instance.status = "completed";
    return this.persist(instance);
  }

  private async compensate(
    instance: SagaInstance,
    def: SagaDefinition,
    stack: CompensationStack,
  ): Promise<void> {
    const order = stack.toCompensateOrder();
    for (const completed of order) {
      const stepDef = def.steps.find((s) => s.id === completed.stepId);
      if (!stepDef?.compensate) continue;
      const handler = this.handlers.get(stepDef.compensate);
      const stepState = instance.steps.find((s) => s.stepId === completed.stepId);
      if (!handler || !stepState) continue;
      stepState.status = "compensating";
      try {
        await handler.execute(
          {
            runId: instance.runId,
            taskId: stepDef.id,
            input: completed.output ?? {},
            priorOutputs: {},
          },
          {
            id: stepDef.id,
            name: `compensate-${stepDef.name}`,
            handler: stepDef.compensate,
            timeoutMs: stepDef.timeoutMs,
          },
        );
        stepState.status = "compensated";
      } catch (err) {
        this.log.error("saga compensation failed", {
          sagaId: instance.id,
          stepId: stepDef.id,
          err: err instanceof Error ? err.message : String(err),
        });
      }
    }
    instance.status = "compensated";
  }

  get(id: string): SagaInstance | undefined {
    return this.instances.get(id);
  }

  private persist(instance: SagaInstance): SagaInstance {
    instance.updatedAt = this.clock.nowIso();
    this.instances.set(instance.id, instance);
    return instance;
  }
}
