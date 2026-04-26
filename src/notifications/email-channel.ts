import type { NotificationChannel, NotificationMessage } from "./channel.js";
import type { Logger } from "../utils/logger.js";

export interface EmailChannelConfig {
  from: string;
  smtpHost: string;
  enabled: boolean;
}

export class EmailNotificationChannel implements NotificationChannel {
  readonly name = "email";

  constructor(
    private readonly config: EmailChannelConfig,
    private readonly log: Logger,
  ) {}

  async send(message: NotificationMessage): Promise<boolean> {
    if (!this.config.enabled) {
      this.log.debug("email channel disabled, skipping", { subject: message.subject });
      return false;
    }
    this.log.info("email notification queued", {
      from: this.config.from,
      host: this.config.smtpHost,
      subject: message.subject,
      severity: message.severity,
    });
    return true;
  }
}
