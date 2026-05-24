import { createContainer } from "../src/container.js";

async function main() {
  const { jobImporter, log } = createContainer();
  const result = await jobImporter.importDirectory(new URL("../config/jobs", import.meta.url).pathname);
  log.info("import complete", result);
}

main().catch(console.error);
