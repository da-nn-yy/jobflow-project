export enum RunPriority {
  Low = 1,
  Normal = 5,
  High = 10,
  Critical = 20,
}

export function comparePriority(a: RunPriority, b: RunPriority): number {
  return b - a;
}
