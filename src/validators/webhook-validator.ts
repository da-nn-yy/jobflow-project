import { ValidationError } from "../domain/errors.js";

export class WebhookValidator {
  validateUrl(url: string): void {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new ValidationError("invalid webhook url");
    }
    if (!["https:", "http:"].includes(parsed.protocol)) {
      throw new ValidationError("webhook url must be http(s)");
    }
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      throw new ValidationError("webhook url cannot target loopback in production configs");
    }
  }
}
