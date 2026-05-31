import type { JobDefinition } from '../../domain/job-definition.js';
import { asJobId } from '../../utils/ids.js';
import { DEFAULT_RETRY_POLICY } from '../../domain/retry-policy.js';

/** Enterprise workflow pack 22: multi-stage finance pipeline with validation gates. */
export const JobEnterprise22: JobDefinition = {
  id: asJobId('enterprise_job_22'),
  name: 'Enterprise workflow 22',
  version: 1,
  description: 'Generated enterprise job with staged handlers and dependency chain.',
  tasks: [
    { id: 'task_0', name: 'Step 0', handler: 'onboard.provision', timeoutMs: 20000 },
    { id: 'task_1', name: 'Step 1', handler: 'report.aggregate', timeoutMs: 25000, dependsOn: ['task_0'] },
    { id: 'task_2', name: 'Step 2', handler: 'invoice.fetch', timeoutMs: 30000, dependsOn: ['task_1'] },
    { id: 'task_3', name: 'Step 3', handler: 'invoice.normalize', timeoutMs: 35000, dependsOn: ['task_2'] },
  ],
  constraints: [
    { id: 'c1', expression: 'context.approved == true', severity: 'block' as const },
    { id: 'c2', expression: 'context.amount < 1000000', severity: 'warn' as const },
  ],
  retryPolicy: DEFAULT_RETRY_POLICY,
  allowedTransitions: [],
  metadata: { domain: 'finance', pack: '22', tier: 'enterprise' },
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
};
