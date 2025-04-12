/**
 * Timer Types
 *
 * Defines types for timer-related functionality.
 */

export interface ITimerState {
  contentId: string;
  remainingTime: number;
  isActive: boolean;
  status?: 'running' | 'paused' | 'error';
  error?: ITimerError;
}

export interface ITimerStats {
  activeTimers: number;
  totalProcessed: number;
  totalErrors: number;
  memoryUsage: number;
  memoryLimit: number;
  memoryThreshold: number;
  memoryHistory: number[];
  memoryTrend: number;
}

export interface ITimerError {
  contentId?: string;
  message: string;
  code: string;
  retryCount?: number;
  recoveryAttempts?: number;
}

export interface ITimerRecovery {
  contentId: string;
  message: string;
  retryCount: number;
}

export interface ITimerUpdate {
  contentId: string;
  remainingTime: number;
  priority: number;
}
