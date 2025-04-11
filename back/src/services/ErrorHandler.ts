import { EventEmitter } from 'node:events';

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
  id: string;
  timestamp: Date;
  category: ErrorCategory;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface IErrorDetails {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  contentId?: string;
  contentType?: 'post' | 'comment';
}

class ErrorHandler extends EventEmitter {
  private static instance: ErrorHandler;
  private errorCount = 0;
  private errorThreshold = 100;
  private errorWindow: number = 60 * 60 * 1000; // 1 hour in milliseconds
  private errorTimestamps: Date[] = [];
  private readonly MAX_ERRORS = 1000;

  private constructor() {
    super();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle an error
   * @param error The error to handle
   * @param details Additional details about the error
   * @returns void
   */
  public handleError(error: Error, details: Partial<IErrorDetails> = {}): void {
    // Create a complete error details object
    const errorDetails: IErrorDetails = {
      message: error.message,
      severity: details.severity || ErrorSeverity.MEDIUM,
      category: details.category || ErrorCategory.UNKNOWN,
      timestamp: new Date(),
      stack: error.stack,
      context: details.context || {},
      userId: details.userId,
      contentId: details.contentId,
      contentType: details.contentType,
    };

    // Increment the error count
    this.errorCount++;

    // Add the timestamp to the window
    this.errorTimestamps.push(errorDetails.timestamp);

    // Remove timestamps outside the window
    const cutoffTime = new Date(Date.now() - this.errorWindow);
    this.errorTimestamps = this.errorTimestamps.filter((timestamp) => timestamp > cutoffTime);

    // Check if we've exceeded the error threshold
    if (this.errorTimestamps.length > this.errorThreshold) {
      this.emit('errorThresholdExceeded', {
        count: this.errorTimestamps.length,
        threshold: this.errorThreshold,
        window: this.errorWindow,
        timestamp: new Date(),
      });
    }

    // Emit the error event
    this.emit('error', errorDetails);

    // Emit category-specific events
    this.emit(`error:${errorDetails.category}`, errorDetails);

    // Emit severity-specific events
    this.emit(`error:${errorDetails.severity}`, errorDetails);
  }

  /**
   * Set the error threshold
   * @param threshold The new error threshold
   * @returns void
   */
  public setErrorThreshold(threshold: number): void {
    if (threshold > 0) {
      this.errorThreshold = threshold;
      this.emit('errorThresholdChanged', {
        newThreshold: threshold,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Set the error window
   * @param window The new error window in milliseconds
   * @returns void
   */
  public setErrorWindow(window: number): void {
    if (window > 0) {
      this.errorWindow = window;
      this.emit('errorWindowChanged', {
        newWindow: window,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get the current error count
   * @returns number
   */
  public getErrorCount(): number {
    return this.errorCount;
  }

  /**
   * Get the current error rate (errors per hour)
   * @returns number
   */
  public getErrorRate(): number {
    const hours = this.errorWindow / (60 * 60 * 1000);
    return this.errorTimestamps.length / hours;
  }

  /**
   * Reset the error count
   * @returns void
   */
  public resetErrorCount(): void {
    this.errorCount = 0;
    this.errorTimestamps = [];
    this.emit('errorCountReset', { timestamp: new Date() });
  }
}

export default ErrorHandler.getInstance();
