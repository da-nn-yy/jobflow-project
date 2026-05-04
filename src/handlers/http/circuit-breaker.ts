export enum CircuitState {
  Closed = "closed",
  Open = "open",
  HalfOpen = "half_open",
}

export class CircuitBreaker {
  private state = CircuitState.Closed;
  private failures = 0;
  private lastFailureAt = 0;

  constructor(
    private readonly threshold: number,
    private readonly cooldownMs: number,
  ) {}

  canExecute(): boolean {
    if (this.state === CircuitState.Closed) return true;
    if (this.state === CircuitState.Open) {
      if (Date.now() - this.lastFailureAt >= this.cooldownMs) {
        this.state = CircuitState.HalfOpen;
        return true;
      }
      return false;
    }
    return true;
  }

  recordSuccess(): void {
    this.failures = 0;
    this.state = CircuitState.Closed;
  }

  recordFailure(): void {
    this.failures += 1;
    this.lastFailureAt = Date.now();
    if (this.failures >= this.threshold) {
      this.state = CircuitState.Open;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
