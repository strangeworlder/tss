export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  DATABASE = 'database',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  CACHE = 'cache',
  MONITORING = 'monitoring',
  SECURITY = 'security',
  UPDATE = 'update',
  SCHEDULING = 'scheduling',
  NOTIFICATION = 'notification',
  UNKNOWN = 'unknown',
}

export interface IError {
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: Date;
  stack?: string;
  metadata?: Record<string, unknown>;
}
