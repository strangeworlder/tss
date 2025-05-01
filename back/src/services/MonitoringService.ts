import { EventEmitter } from 'node:events';
import ErrorHandler, { ErrorSeverity, ErrorCategory } from './ErrorHandler';
import BatchProcessor from './BatchProcessor';
import SchedulingService from './SchedulingService';
import PublicationService, { type IPublicationEvent } from './PublicationService';

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface IHealthCheck {
  name: string;
  status: HealthStatus;
  message?: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface IPerformanceMetrics {
  scheduledContentCount: number;
  publishedContentCount: number;
  errorCount: number;
  errorRate: number;
  batchProcessingTime: number;
  averagePublicationTime: number;
  timestamp: Date;
}

class MonitoringService extends EventEmitter {
  private static instance: MonitoringService;
  private healthChecks: Map<string, IHealthCheck> = new Map();
  private performanceMetrics: IPerformanceMetrics | null = null;
  private monitoringInterval: number = 60 * 1000; // 1 minute
  private intervalId: NodeJS.Timeout | null = null;
  private lastBatchProcessingTime = 0;
  private publicationTimes: number[] = [];

  private constructor() {
    super();

    // Listen for events from other services
    this.setupEventListeners();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Set up event listeners for other services
   * @returns void
   */
  private setupEventListeners(): void {
    // Listen for errors from the ErrorHandler
    ErrorHandler.on('error', (errorDetails) => {
      this.updateHealthCheck('errors', {
        name: 'errors',
        status: this.determineHealthStatusFromErrors(errorDetails),
        message: `Error rate: ${ErrorHandler.getErrorRate()} errors/hour`,
        timestamp: new Date(),
        details: {
          errorCount: ErrorHandler.getErrorCount(),
          errorRate: ErrorHandler.getErrorRate(),
          lastError: errorDetails,
        },
      });
    });

    // Listen for batch processing events from the BatchProcessor
    BatchProcessor.on('batchStarted', (data) => {
      const startTime = Date.now();

      BatchProcessor.once('batchCompleted', () => {
        this.lastBatchProcessingTime = Date.now() - startTime;

        this.updateHealthCheck('batchProcessing', {
          name: 'batchProcessing',
          status: this.determineHealthStatusFromBatchProcessing(this.lastBatchProcessingTime),
          message: `Batch processing time: ${this.lastBatchProcessingTime}ms`,
          timestamp: new Date(),
          details: {
            batchProcessingTime: this.lastBatchProcessingTime,
          },
        });
      });
    });

    // Listen for publication events from the PublicationService
    const publicationService = PublicationService.getInstance();
    publicationService.on('contentPublished', (data: IPublicationEvent) => {
      const publicationTime = Date.now() - data.timestamp.getTime();
      this.publicationTimes.push(publicationTime);

      // Keep only the last 100 publication times
      if (this.publicationTimes.length > 100) {
        this.publicationTimes.shift();
      }

      this.updateHealthCheck('publication', {
        name: 'publication',
        status: this.determineHealthStatusFromPublication(publicationTime),
        message: `Average publication time: ${this.calculateAveragePublicationTime()}ms`,
        timestamp: new Date(),
        details: {
          averagePublicationTime: this.calculateAveragePublicationTime(),
          lastPublicationTime: publicationTime,
        },
      });
    });
  }

  /**
   * Start the monitoring service
   * @returns void
   */
  public start(): void {
    if (this.intervalId) {
      return; // Already running
    }

    this.intervalId = setInterval(() => {
      this.collectMetrics().catch((error) => {
        ErrorHandler.handleError(error, {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.MONITORING,
        });
      });
    }, this.monitoringInterval);

    this.emit('started', { timestamp: new Date() });
  }

  /**
   * Stop the monitoring service
   * @returns void
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.emit('stopped', { timestamp: new Date() });
    }
  }

  /**
   * Collect metrics from all services
   * @returns Promise<void>
   */
  public async collectMetrics(): Promise<void> {
    // Get scheduled content count
    const scheduledContent = await SchedulingService.getScheduledContent();

    // Calculate performance metrics
    this.performanceMetrics = {
      scheduledContentCount: scheduledContent.length,
      publishedContentCount: this.publicationTimes.length,
      errorCount: ErrorHandler.getErrorCount(),
      errorRate: ErrorHandler.getErrorRate(),
      batchProcessingTime: this.lastBatchProcessingTime,
      averagePublicationTime: this.calculateAveragePublicationTime(),
      timestamp: new Date(),
    };

    // Emit the metrics event
    this.emit('metrics', this.performanceMetrics);

    // Update the overall health check
    this.updateOverallHealthCheck();
  }

  /**
   * Update a health check
   * @param name The name of the health check
   * @param healthCheck The health check data
   * @returns void
   */
  public updateHealthCheck(name: string, healthCheck: IHealthCheck): void {
    this.healthChecks.set(name, healthCheck);
    this.emit('healthCheckUpdated', { name, healthCheck });
  }

  /**
   * Get all health checks
   * @returns IHealthCheck[]
   */
  public getHealthChecks(): IHealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  /**
   * Get the performance metrics
   * @returns IPerformanceMetrics | null
   */
  public getPerformanceMetrics(): IPerformanceMetrics | null {
    return this.performanceMetrics;
  }

  /**
   * Set the monitoring interval
   * @param interval The new interval in milliseconds
   * @returns void
   */
  public setMonitoringInterval(interval: number): void {
    if (interval > 0) {
      this.monitoringInterval = interval;

      // Restart the interval if it's running
      if (this.intervalId) {
        this.stop();
        this.start();
      }

      this.emit('intervalChanged', {
        newInterval: interval,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Determine the health status from errors
   * @param errorDetails The error details
   * @returns HealthStatus
   */
  private determineHealthStatusFromErrors(errorDetails: any): HealthStatus {
    if (errorDetails.severity === ErrorSeverity.CRITICAL) {
      return HealthStatus.UNHEALTHY;
    }
    if (errorDetails.severity === ErrorSeverity.HIGH) {
      return HealthStatus.DEGRADED;
    }
    return HealthStatus.HEALTHY;
  }

  /**
   * Determine the health status from batch processing
   * @param processingTime The batch processing time
   * @returns HealthStatus
   */
  private determineHealthStatusFromBatchProcessing(processingTime: number): HealthStatus {
    if (processingTime > 10000) {
      // More than 10 seconds
      return HealthStatus.UNHEALTHY;
    }
    if (processingTime > 5000) {
      // More than 5 seconds
      return HealthStatus.DEGRADED;
    }
    return HealthStatus.HEALTHY;
  }

  /**
   * Determine the health status from publication
   * @param publicationTime The publication time
   * @returns HealthStatus
   */
  private determineHealthStatusFromPublication(publicationTime: number): HealthStatus {
    if (publicationTime > 5000) {
      // More than 5 seconds
      return HealthStatus.UNHEALTHY;
    }
    if (publicationTime > 2000) {
      // More than 2 seconds
      return HealthStatus.DEGRADED;
    }
    return HealthStatus.HEALTHY;
  }

  /**
   * Calculate the average publication time
   * @returns number
   */
  private calculateAveragePublicationTime(): number {
    if (this.publicationTimes.length === 0) {
      return 0;
    }

    const sum = this.publicationTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.publicationTimes.length;
  }

  /**
   * Update the overall health check
   * @returns void
   */
  private updateOverallHealthCheck(): void {
    const healthChecks = this.getHealthChecks();

    // Determine the overall health status
    let status = HealthStatus.HEALTHY;

    for (const healthCheck of healthChecks) {
      if (healthCheck.status === HealthStatus.UNHEALTHY) {
        status = HealthStatus.UNHEALTHY;
        break;
      }
      if (healthCheck.status === HealthStatus.DEGRADED) {
        status = HealthStatus.DEGRADED;
      }
    }

    // Update the overall health check
    this.updateHealthCheck('overall', {
      name: 'overall',
      status,
      message: `Overall health status: ${status}`,
      timestamp: new Date(),
      details: {
        healthChecks: healthChecks.map((check) => ({
          name: check.name,
          status: check.status,
        })),
      },
    });
  }
}

export default MonitoringService.getInstance();
