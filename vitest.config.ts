import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/definitions/jobs/**",
        "src/index.ts",
      ],
      thresholds: {
        lines: 55,
        functions: 50,
        branches: 45,
        statements: 55,
      },
    },
  },
});
