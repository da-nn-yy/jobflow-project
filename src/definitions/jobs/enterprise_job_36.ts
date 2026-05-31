import type { JobDefinition } from '../../domain/job-definition.js';
import { asJobId } from '../../utils/ids.js';
import { DEFAULT_RETRY_POLICY } from '../../domain/retry-policy.js';

/** Enterprise workflow pack 36: multi-stage finance pipeline with validation gates. */
export const JobEnterprise36: JobDefinition = {
  id: asJobId('enterprise_job_36'),
  name: 'Enterprise workflow 36',
  version: 1,
  description: 'Generated enterprise job with staged handlers and dependency chain.',
  tasks: [
    { id: 'task_0', name: 'Step 0', handler: 'reconcile.match', timeoutMs: 20000 },
    { id: 'task_1', name: 'Step 1', handler: 'onboard.validate', timeoutMs: 25000, dependsOn: ['task_0'] },
    { id: 'task_2', name: 'Step 2', handler: 'onboard.provision', timeoutMs: 30000, dependsOn: ['task_1'] },
    { id: 'task_3', name: 'Step 3', handler: 'report.aggregate', timeoutMs: 35000, dependsOn: ['task_2'] },
  ],
  constraints: [
    { id: 'c1', expression: 'context.approved == true', severity: 'block' as const },
    { id: 'c2', expression: 'context.amount < 1000000', severity: 'warn' as const },
  ],
  retryPolicy: DEFAULT_RETRY_POLICY,
  allowedTransitions: [],
  metadata: { domain: 'finance', pack: '36', tier: 'enterprise' },
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
};
