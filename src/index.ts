const configPath = process.env.JOBFLOW_CONFIG;

import { bootstrap } from "./app.js";

bootstrap(configPath).catch((err) => {
  console.error(JSON.stringify({ level: "error", msg: "fatal", err: String(err) }));
  process.exit(1);
});
