import { loadConfig } from "./config/loader.js";
import { createContainer } from "./container.js";
import { createServer } from "./api/server.js";

export async function bootstrap(configPath?: string) {
  const config = configPath ? await loadConfig(configPath) : (await import("./config/loader.js")).loadConfigSync();
  const container = createContainer(config);
  await container.migrationRunner.migrate();
  await container.catalogLoader.seedIfEmpty();
  const app = await createServer(config, container);
  return { app, ...container };
}
