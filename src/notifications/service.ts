import type { NotificationChannel, NotificationMessage } from "./channel.js";

export class NotificationService {
  constructor(private readonly channels: NotificationChannel[]) {}

  async broadcast(message: NotificationMessage): Promise<number> {
    let sent = 0;
    for (const ch of this.channels) {
      if (await ch.send(message)) sent += 1;
    }
    return sent;
  }

  async notifyRunFailure(runId: string, jobName: string, reason: string): Promise<number> {
    return this.broadcast({
      subject: `Run ${runId} failed`,
      body: reason,
      severity: "critical",
      metadata: { runId, jobName },
    });
  }
}
