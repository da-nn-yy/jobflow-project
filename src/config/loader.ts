import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { EngineConfig } from "./defaults.js";
import { DEFAULT_CONFIG } from "./defaults.js";
import { engineConfigSchema } from "./schema.js";

export async function loadConfig(path?: string): Promise<EngineConfig> {
  if (!path) {
    return { ...DEFAULT_CONFIG };
  }
  const raw = await readFile(resolve(path), "utf8");
  const parsed = JSON.parse(raw) as unknown;
  const result = engineConfigSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`invalid config: ${result.error.message}`);
  }
  return { ...DEFAULT_CONFIG, ...result.data };
}

export function loadConfigSync(overrides: Partial<EngineConfig> = {}): EngineConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}
