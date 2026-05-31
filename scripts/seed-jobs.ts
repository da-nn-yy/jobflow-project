import { createContainer } from "../src/container.js";

const samples = [
  {
    id: "invoice_sync",
    name: "Invoice sync pipeline",
    version: 2,
    tasks: [
      { id: "fetch", name: "Fetch", handler: "invoice.fetch", timeoutMs: 15000 },
      { id: "normalize", name: "Normalize", handler: "invoice.normalize", timeoutMs: 10000, dependsOn: ["fetch"] },
      { id: "post", name: "Post GL", handler: "invoice.post_gl", timeoutMs: 20000, dependsOn: ["normalize"] },
    ],
    constraints: [{ id: "require_tenant", expression: "ctx.tenantId", severity: "block" as const }],
  },
  {
    id: "nightly_reconcile",
    name: "Nightly reconcile",
    version: 1,
    tasks: [
      { id: "extract", name: "Extract", handler: "reconcile.extract", timeoutMs: 30000 },
      { id: "match", name: "Match", handler: "reconcile.match", timeoutMs: 60000, dependsOn: ["extract"] },
      { id: "notify", name: "Notify", handler: "external.risky_notify", timeoutMs: 5000, dependsOn: ["match"], optional: true },
    ],
    constraints: [],
  },
];

async function main() {
  const { jobService } = createContainer();
  for (const s of samples) {
    const def = await jobService.register(s);
    console.log(`registered ${def.id} v${def.version}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
