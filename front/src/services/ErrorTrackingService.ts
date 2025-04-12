import type { ITimerError, ITimerRecovery } from '@/types/timer';

export interface IErrorCategory {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoveryStrategy: string;
}

export interface IErrorAnalytics {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recoveryRate: number;
  averageRecoveryTime: number;
  recentErrors: ITimerError[];
  errorTrend: number[];
}

export class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private errorCategories: Map<string, IErrorCategory>;
  private errorLog: ITimerError[] = [];
  private recoveryLog: ITimerRecovery[] = [];
  private analytics: IErrorAnalytics = {
    totalErrors: 0,
    errorsByCategory: {},
    errorsBySeverity: {},
    recoveryRate: 0,
    averageRecoveryTime: 0,
    recentErrors: [],
    errorTrend: [],
  };
  private notificationHandlers: ((error: ITimerError) => void)[] = [];
  private logHandlers: ((error: ITimerError) => void)[] = [];
  private analyticsHandlers: ((analytics: IErrorAnalytics) => void)[] = [];

  private constructor() {
    this.errorCategories = new Map([
      [
        'WORKER_ERROR',
        {
          id: 'WORKER_ERROR',
          name: 'Worker Error',
          description: 'Error occurred in the Web Worker',
          severity: 'high',
          recoveryStrategy: 'restart_worker',
        },
      ],
      [
        'TIMER_ERROR',
        {
          id: 'TIMER_ERROR',
          name: 'Timer Error',
          description: 'Error occurred in timer processing',
          severity: 'medium',
          recoveryStrategy: 'retry_timer',
        },
      ],
      [
        'SYNC_ERROR',
        {
          id: 'SYNC_ERROR',
          name: 'Sync Error',
          description: 'Error occurred during state synchronization',
          severity: 'medium',
          recoveryStrategy: 'retry_sync',
        },
      ],
      [
        'STORAGE_ERROR',
        {
          id: 'STORAGE_ERROR',
          name: 'Storage Error',
          description: 'Error occurred during state persistence',
          severity: 'high',
          recoveryStrategy: 'clear_storage',
        },
      ],
      [
        'MEMORY_ERROR',
        {
          id: 'MEMORY_ERROR',
          name: 'Memory Error',
          description: 'Error occurred due to memory constraints',
          severity: 'critical',
          recoveryStrategy: 'cleanup_memory',
        },
      ],
    ]);
  }

  public static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  /**
   * Track a new error
   * @param error The error to track
   */
  trackError(error: ITimerError): void {
    // Add to error log
    this.errorLog.push(error);
    this.analytics.recentErrors.unshift(error);
    if (this.analytics.recentErrors.length > 100) {
      this.analytics.recentErrors.pop();
    }

    // Update analytics
    this.updateAnalytics();

    // Notify handlers
    this.notifyHandlers(error);
    this.logError(error);
  }

  /**
   * Track a recovery
   * @param recovery The recovery to track
   */
  trackRecovery(recovery: ITimerRecovery): void {
    this.recoveryLog.push(recovery);
    this.updateAnalytics();
  }

  /**
   * Get error category
   * @param errorCode The error code
   * @returns The error category or undefined if not found
   */
  getErrorCategory(errorCode: string): IErrorCategory | undefined {
    return this.errorCategories.get(errorCode);
  }

  /**
   * Get current analytics
   * @returns The current analytics data
   */
  getAnalytics(): IErrorAnalytics {
    return this.analytics;
  }

  /**
   * Get error log
   * @returns The error log
   */
  getErrorLog(): ITimerError[] {
    return this.errorLog;
  }

  /**
   * Get recovery log
   * @returns The recovery log
   */
  getRecoveryLog(): ITimerRecovery[] {
    return this.recoveryLog;
  }

  /**
   * Add notification handler
   * @param handler The handler to add
   */
  addNotificationHandler(handler: (error: ITimerError) => void): void {
    this.notificationHandlers.push(handler);
  }

  /**
   * Add log handler
   * @param handler The handler to add
   */
  addLogHandler(handler: (error: ITimerError) => void): void {
    this.logHandlers.push(handler);
  }

  /**
   * Add analytics handler
   * @param handler The handler to add
   */
  addAnalyticsHandler(handler: (analytics: IErrorAnalytics) => void): void {
    this.analyticsHandlers.push(handler);
  }

  /**
   * Update analytics
   */
  private updateAnalytics(): void {
    // Update total errors
    this.analytics.totalErrors = this.errorLog.length;

    // Update errors by category
    this.analytics.errorsByCategory = {};
    for (const error of this.errorLog) {
      const category = this.getErrorCategory(error.code);
      if (category) {
        const categoryId = category.id;
        if (!this.analytics.errorsByCategory[categoryId]) {
          this.analytics.errorsByCategory[categoryId] = 0;
        }
        this.analytics.errorsByCategory[categoryId]++;
      }
    }

    // Update errors by severity
    this.analytics.errorsBySeverity = {};
    for (const error of this.errorLog) {
      const category = this.getErrorCategory(error.code);
      if (category) {
        const severity = category.severity;
        if (!this.analytics.errorsBySeverity[severity]) {
          this.analytics.errorsBySeverity[severity] = 0;
        }
        this.analytics.errorsBySeverity[severity]++;
      }
    }

    // Update recovery rate
    const totalRecoverableErrors = this.errorLog.filter((error) => {
      const category = this.getErrorCategory(error.code);
      return category && category.recoveryStrategy !== 'none';
    }).length;
    this.analytics.recoveryRate =
      totalRecoverableErrors > 0 ? this.recoveryLog.length / totalRecoverableErrors : 0;

    // Update average recovery time
    if (this.recoveryLog.length > 0) {
      const totalRecoveryTime = this.recoveryLog.reduce(
        (sum, recovery) => sum + recovery.retryCount,
        0
      );
      this.analytics.averageRecoveryTime = totalRecoveryTime / this.recoveryLog.length;
    }

    // Update error trend (last 24 hours)
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const hourlyErrors = new Array(24).fill(0);

    for (const error of this.errorLog) {
      // Since ITimerError doesn't have a timestamp property, we'll use now
      // In a real implementation, we would store the timestamp when tracking the error
      const errorTime = now; // Default to current time if no timestamp is available
      if (errorTime >= oneDayAgo) {
        const hour = Math.floor((errorTime - oneDayAgo) / (60 * 60 * 1000));
        if (hour >= 0 && hour < 24) {
          hourlyErrors[hour]++;
        }
      }
    }

    this.analytics.errorTrend = hourlyErrors;

    // Notify analytics handlers
    for (const handler of this.analyticsHandlers) {
      handler(this.analytics);
    }
  }

  /**
   * Notify handlers of new error
   * @param error The error to notify about
   */
  private notifyHandlers(error: ITimerError): void {
    for (const handler of this.notificationHandlers) {
      handler(error);
    }
  }

  /**
   * Log error
   * @param error The error to log
   */
  private logError(error: ITimerError): void {
    for (const handler of this.logHandlers) {
      handler(error);
    }
  }
}
