import type { DomainEvent, DomainEventListener } from "../domain/events.js";

export class EventBus {
  private listeners: DomainEventListener[] = [];

  subscribe(listener: DomainEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  publish(event: DomainEvent): void {
    for (const l of this.listeners) {
      try {
        l(event);
      } catch {
        // listener failures must not break publishers
      }
    }
  }
}
