export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface IHealthCheck {
  service: string;
  status: HealthStatus;
  timestamp: Date;
  details?: {
    errors?: number;
    avgProcessingTime?: number;
    avgPublicationTime?: number;
    queueSize?: number;
    [key: string]: unknown;
  };
}

export interface IPerformanceMetrics {
  batchProcessingTime: number[];
  publicationTime: number[];
  errorCount: number;
  queueSize: number;
}
