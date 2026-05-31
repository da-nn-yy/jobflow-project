import { loadConfig } from "./config/loader.js";
import { createContainer } from "./container.js";
import { createServer } from "./api/server.js";

export async function bootstrap(configPath?: string) {
  const config = configPath ? await loadConfig(configPath) : (await import("./config/loader.js")).loadConfigSync();
  const container = createContainer(config);
  const app = await createServer(config, {
    jobs: container.jobService,
    workflows: container.workflowService,
    execution: container.executionService,
    log: container.log,
  });
  return { app, ...container };
}
