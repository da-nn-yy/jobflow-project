export interface NotificationMessage {
  subject: string;
  body: string;
  severity: "info" | "warning" | "critical";
  metadata: Record<string, unknown>;
}

export interface NotificationChannel {
  readonly name: string;
  send(message: NotificationMessage): Promise<boolean>;
}
