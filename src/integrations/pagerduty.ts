export interface PagerDutyPayload {
  routing_key: string;
  event_action: "trigger" | "resolve";
  payload: {
    summary: string;
    severity: "critical" | "error" | "warning";
    source: string;
    custom_details?: Record<string, unknown>;
  };
}

export function buildFailureEvent(runId: string, jobId: string, reason: string): PagerDutyPayload {
  return {
    routing_key: "placeholder",
    event_action: "trigger",
    payload: {
      summary: `Jobflow run ${runId} failed`,
      severity: "error",
      source: "jobflow-engine",
      custom_details: { runId, jobId, reason },
    },
  };
}
