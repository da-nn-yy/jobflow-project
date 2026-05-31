import type { EngineConfig } from "../config/defaults.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

export function createLogger(config: Pick<EngineConfig, "logLevel">, bindings: Record<string, unknown> = {}): Logger {
  const minLevel = LEVEL_ORDER[config.logLevel];

  const log = (level: LogLevel, msg: string, meta?: Record<string, unknown>) => {
    if (LEVEL_ORDER[level] < minLevel) {
      return;
    }
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg,
      ...bindings,
      ...meta,
    });
    if (level === "error") {
      console.error(line);
    } else {
      console.log(line);
    }
  };

  return {
    debug: (m, meta) => log("debug", m, meta),
    info: (m, meta) => log("info", m, meta),
    warn: (m, meta) => log("warn", m, meta),
    error: (m, meta) => log("error", m, meta),
    child: (b) => createLogger(config, { ...bindings, ...b }),
  };
}
