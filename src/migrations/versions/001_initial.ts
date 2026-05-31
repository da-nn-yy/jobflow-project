import type { Migration } from "../types.js";

export const migration001: Migration = {
  version: 1,
  name: "initial_schema",
  async up() {
    /* logical: job_definitions, job_runs, workflow_instances tables */
  },
  async down() {},
};
