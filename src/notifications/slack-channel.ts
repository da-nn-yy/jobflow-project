import { formatRunFailureMessage } from "../integrations/slack.js";
import type { NotificationChannel, NotificationMessage } from "./channel.js";
import type { Logger } from "../utils/logger.js";

export class SlackNotificationChannel implements NotificationChannel {
  readonly name = "slack";

  constructor(
    private readonly webhookUrl: string,
    private readonly log: Logger,
  ) {}

  async send(message: NotificationMessage): Promise<boolean> {
    const runId = String(message.metadata.runId ?? "unknown");
    const jobName = String(message.metadata.jobName ?? "job");
    const blocks = formatRunFailureMessage(runId, jobName, message.body);
    try {
      const res = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ blocks }),
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch (err) {
      this.log.warn("slack notification failed", { err: String(err) });
      return false;
    }
  }
}
