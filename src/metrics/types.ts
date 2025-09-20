export interface CounterMetric {
  name: string;
  labels: Record<string, string>;
  value: number;
}

export interface HistogramBucket {
  le: number;
  count: number;
}

export interface HistogramMetric {
  name: string;
  labels: Record<string, string>;
  sum: number;
  count: number;
  buckets: HistogramBucket[];
}
