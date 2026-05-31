export interface Clock {
  now(): Date;
  nowIso(): string;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }

  nowIso(): string {
    return this.now().toISOString();
  }
}

export class FakeClock implements Clock {
  private current: Date;

  constructor(initial: Date = new Date("2026-01-01T00:00:00.000Z")) {
    this.current = initial;
  }

  now(): Date {
    return new Date(this.current);
  }

  nowIso(): string {
    return this.now().toISOString();
  }

  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }

  set(iso: string): void {
    this.current = new Date(iso);
  }
}
