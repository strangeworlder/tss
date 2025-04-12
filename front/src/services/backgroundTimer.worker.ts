/**
 * Background Timer Worker
 *
 * Handles timer processing in a separate thread to ensure accurate timing
 * even when the main thread is busy or the app is in the background.
 * Uses performance.now() for high-precision timing and requestAnimationFrame
 * for better performance.
 */

// Add Chrome-specific Performance interface extension
declare global {
  interface PerformanceMemory {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  }

  interface Performance {
    memory?: PerformanceMemory;
  }
}

interface TimerData {
  contentId: string;
  publishAt: number;
  remainingTime: number;
}

interface TimerState {
  contentId: string;
  publishAt: number;
  remainingTime: number;
  lastUpdate: number;
  isActive: boolean;
  errorCount: number;
  maxRetries: number;
  animationFrameId?: number;
  lastAccess: number;
  priority: number;
}

interface TimerError {
  code: string;
  message: string;
  contentId?: string;
  retryCount?: number;
  lastErrorTime?: number;
  recoveryAttempts: number;
}

const timers = new Map<string, TimerState>();
const MAX_TIMERS = 100; // Maximum number of concurrent timers
const ERROR_THRESHOLD = 3; // Maximum number of errors before giving up
const MEMORY_CHECK_INTERVAL = 60000; // Check memory every minute
const UPDATE_INTERVAL = 1000; // 1 second
const MEMORY_THRESHOLD = 0.8; // 80% memory usage threshold
const INACTIVE_TIMER_THRESHOLD = 300000; // 5 minutes
const PRIORITY_LEVELS = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

// Performance monitoring
let lastMemoryCheck = performance.now();
let totalTimersProcessed = 0;
let totalErrors = 0;
const isProcessing = false;
let memoryHistory: number[] = [];
const MEMORY_HISTORY_SIZE = 10;
let cleanupInProgress = false;

const ERROR_RECOVERY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 seconds
  MAX_RECOVERY_ATTEMPTS: 2,
  RECOVERY_DELAY: 10000, // 10 seconds
};

const errorStates = new Map<string, TimerError>();

/**
 * Calculate timer priority based on remaining time and error count
 * @param timer Timer state
 * @returns Priority level
 */
function calculatePriority(timer: TimerState): number {
  if (timer.errorCount > 0) return PRIORITY_LEVELS.HIGH;
  if (timer.remainingTime < 60000) return PRIORITY_LEVELS.HIGH; // Less than 1 minute
  if (timer.remainingTime < 300000) return PRIORITY_LEVELS.MEDIUM; // Less than 5 minutes
  return PRIORITY_LEVELS.LOW;
}

/**
 * Check memory usage and clean up if necessary
 */
function checkMemoryUsage(): void {
  const now = performance.now();
  if (now - lastMemoryCheck >= MEMORY_CHECK_INTERVAL) {
    const memoryInfo = performance.memory;
    if (memoryInfo) {
      const memoryUsage = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;

      // Track memory history
      memoryHistory.push(memoryUsage);
      if (memoryHistory.length > MEMORY_HISTORY_SIZE) {
        memoryHistory.shift();
      }

      // Calculate memory trend
      const memoryTrend =
        memoryHistory.length > 1 ? memoryHistory[memoryHistory.length - 1] - memoryHistory[0] : 0;

      // Clean up if memory usage is high or increasing rapidly
      if (memoryUsage > MEMORY_THRESHOLD || memoryTrend > 0.1) {
        cleanupInactiveTimers();
        cleanupLowPriorityTimers();
      }
    }
    lastMemoryCheck = now;
  }
}

/**
 * Clean up inactive timers
 */
function cleanupInactiveTimers(): void {
  const now = performance.now();
  for (const [contentId, timer] of timers.entries()) {
    if (now - timer.lastAccess > INACTIVE_TIMER_THRESHOLD) {
      cleanupTimer(contentId);
    }
  }
}

/**
 * Clean up low priority timers
 */
function cleanupLowPriorityTimers(): void {
  const timersToCleanup = Array.from(timers.entries())
    .filter(([_, timer]) => timer.priority === PRIORITY_LEVELS.LOW)
    .sort((a, b) => a[1].lastAccess - b[1].lastAccess);

  // Clean up up to 20% of low priority timers
  const cleanupCount = Math.ceil(timersToCleanup.length * 0.2);
  for (let i = 0; i < cleanupCount; i++) {
    cleanupTimer(timersToCleanup[i][0]);
  }
}

/**
 * Clean up all timers and resources
 */
function cleanupAll(): void {
  if (cleanupInProgress) return;
  cleanupInProgress = true;

  try {
    // Cancel all animation frames
    for (const [contentId, timer] of timers.entries()) {
      if (timer.animationFrameId) {
        cancelAnimationFrame(timer.animationFrameId);
      }
    }

    // Clear all timers
    timers.clear();

    // Reset performance monitoring
    totalTimersProcessed = 0;
    totalErrors = 0;
    memoryHistory = [];
    lastMemoryCheck = performance.now();

    // Notify main thread
    self.postMessage({
      type: 'cleanupComplete',
      data: {
        message: 'All timers and resources cleaned up',
        totalCleaned: timers.size,
      },
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: {
        message: `Error during cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'CLEANUP_ERROR',
      },
    });
  } finally {
    cleanupInProgress = false;
  }
}

/**
 * Clean up a timer and its resources
 * @param contentId The content ID
 */
function cleanupTimer(contentId: string): void {
  const timer = timers.get(contentId);
  if (timer) {
    try {
      if (timer.animationFrameId) {
        cancelAnimationFrame(timer.animationFrameId);
      }
      timers.delete(contentId);

      // Notify main thread
      self.postMessage({
        type: 'timerCleaned',
        data: {
          contentId,
          message: 'Timer cleaned up successfully',
        },
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        data: {
          contentId,
          message: `Error cleaning up timer: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'TIMER_CLEANUP_ERROR',
        },
      });
    }
  }
}

/**
 * Start a new timer with high-precision timing
 * @param data Timer data
 */
function startTimer(data: TimerData): void {
  // Check memory usage before starting new timer
  checkMemoryUsage();

  // Enforce maximum timer limit
  if (timers.size >= MAX_TIMERS) {
    self.postMessage({
      type: 'error',
      data: {
        message: 'Maximum number of timers reached',
        code: 'MAX_TIMERS_EXCEEDED',
      },
    });
    return;
  }

  const { contentId, publishAt, remainingTime } = data;

  // Clear existing timer if any
  cleanupTimer(contentId);

  const timerState: TimerState = {
    contentId,
    publishAt,
    remainingTime,
    lastUpdate: performance.now(),
    lastAccess: performance.now(),
    isActive: true,
    errorCount: 0,
    maxRetries: ERROR_THRESHOLD,
    priority: PRIORITY_LEVELS.MEDIUM,
  };

  // Calculate initial priority
  timerState.priority = calculatePriority(timerState);

  timers.set(contentId, timerState);

  // Use requestAnimationFrame for better performance
  function updateTimer() {
    const timer = timers.get(contentId);
    if (!timer || !timer.isActive) return;

    const now = performance.now();
    const deltaTime = now - timer.lastUpdate;

    if (deltaTime >= UPDATE_INTERVAL) {
      timer.remainingTime -= deltaTime;
      timer.lastUpdate = now;
      timer.lastAccess = now;
      timer.priority = calculatePriority(timer);

      // Send update to main thread
      self.postMessage({
        type: 'timerUpdate',
        data: {
          contentId,
          remainingTime: timer.remainingTime,
          priority: timer.priority,
        },
      });

      // Check if timer is complete
      if (timer.remainingTime <= 0) {
        cleanupTimer(contentId);
        totalTimersProcessed++;

        // Send completion message to main thread
        self.postMessage({
          type: 'timerComplete',
          data: { contentId },
        });
        return;
      }
    }

    // Schedule next update
    timer.animationFrameId = requestAnimationFrame(updateTimer);
  }

  // Start the timer
  timerState.animationFrameId = requestAnimationFrame(updateTimer);
}

/**
 * Pause a timer
 * @param contentId The content ID
 */
function pauseTimer(contentId: string): void {
  const timer = timers.get(contentId);
  if (!timer) return;

  timer.isActive = false;
  timer.lastAccess = performance.now();
  if (timer.animationFrameId) {
    cancelAnimationFrame(timer.animationFrameId);
    timer.animationFrameId = undefined;
  }
}

/**
 * Resume a timer
 * @param data Timer data
 */
function resumeTimer(data: TimerData): void {
  const timer = timers.get(data.contentId);
  if (!timer) {
    startTimer(data);
    return;
  }

  timer.isActive = true;
  timer.lastUpdate = performance.now();
  timer.lastAccess = performance.now();
  timer.priority = calculatePriority(timer);

  // Restart the animation frame
  function updateTimer() {
    const timer = timers.get(data.contentId);
    if (!timer || !timer.isActive) return;

    const now = performance.now();
    const deltaTime = now - timer.lastUpdate;

    if (deltaTime >= UPDATE_INTERVAL) {
      timer.remainingTime -= deltaTime;
      timer.lastUpdate = now;
      timer.lastAccess = now;
      timer.priority = calculatePriority(timer);

      // Send update to main thread
      self.postMessage({
        type: 'timerUpdate',
        data: {
          contentId: data.contentId,
          remainingTime: timer.remainingTime,
          priority: timer.priority,
        },
      });

      // Check if timer is complete
      if (timer.remainingTime <= 0) {
        cleanupTimer(data.contentId);
        totalTimersProcessed++;

        // Send completion message to main thread
        self.postMessage({
          type: 'timerComplete',
          data: { contentId: data.contentId },
        });
        return;
      }
    }

    // Schedule next update
    timer.animationFrameId = requestAnimationFrame(updateTimer);
  }

  timer.animationFrameId = requestAnimationFrame(updateTimer);
}

/**
 * Handle errors and implement retry logic
 * @param contentId The content ID
 * @param error The error that occurred
 */
function handleError(contentId: string, error: Error): void {
  const timer = timers.get(contentId);
  if (!timer) return;

  // Initialize errorState with recoveryAttempts if it doesn't exist
  if (!errorStates.has(contentId)) {
    errorStates.set(contentId, {
      code: 'TIMER_ERROR',
      message: error.message,
      contentId,
      retryCount: 0,
      lastErrorTime: performance.now(),
      recoveryAttempts: 0,
    });
  }

  const errorState = errorStates.get(contentId);
  if (!errorState) {
    console.error(`Could not find error state for contentId ${contentId}`);
    return;
  }

  errorState.retryCount = (errorState.retryCount || 0) + 1;
  errorState.lastErrorTime = performance.now();

  // Update error state
  errorStates.set(contentId, errorState);

  // Check if we should attempt recovery
  if (errorState.retryCount <= ERROR_RECOVERY_CONFIG.MAX_RETRIES) {
    // Schedule retry
    setTimeout(() => {
      try {
        // Attempt to recover the timer
        const timer = timers.get(contentId);
        if (timer) {
          timer.isActive = true;
          timer.errorCount = 0;
          timer.lastUpdate = performance.now();
          timer.lastAccess = performance.now();
          timer.priority = calculatePriority(timer);

          // Restart the animation frame
          function updateTimer() {
            const timer = timers.get(contentId);
            if (!timer || !timer.isActive) return;

            const now = performance.now();
            const deltaTime = now - timer.lastUpdate;

            if (deltaTime >= UPDATE_INTERVAL) {
              timer.remainingTime -= deltaTime;
              timer.lastUpdate = now;
              timer.lastAccess = now;
              timer.priority = calculatePriority(timer);

              // Send update to main thread
              self.postMessage({
                type: 'timerUpdate',
                data: {
                  contentId,
                  remainingTime: timer.remainingTime,
                  priority: timer.priority,
                },
              });

              // Check if timer is complete
              if (timer.remainingTime <= 0) {
                cleanupTimer(contentId);
                totalTimersProcessed++;

                // Send completion message to main thread
                self.postMessage({
                  type: 'timerComplete',
                  data: { contentId },
                });
                return;
              }
            }

            // Schedule next update
            timer.animationFrameId = requestAnimationFrame(updateTimer);
          }

          timer.animationFrameId = requestAnimationFrame(updateTimer);

          // Notify main thread of recovery
          self.postMessage({
            type: 'recoverySuccess',
            data: {
              contentId,
              message: `Timer recovered after ${errorState.retryCount} retries`,
              retryCount: errorState.retryCount,
            },
          });
        }
      } catch (recoveryError) {
        // Recovery failed, try more aggressive recovery
        if (errorState.recoveryAttempts < ERROR_RECOVERY_CONFIG.MAX_RECOVERY_ATTEMPTS) {
          errorState.recoveryAttempts++;
          setTimeout(() => {
            // Attempt full timer restart
            const timer = timers.get(contentId);
            if (timer) {
              cleanupTimer(contentId);
              startTimer({
                contentId,
                publishAt: timer.publishAt,
                remainingTime: timer.remainingTime,
              });
            }
          }, ERROR_RECOVERY_CONFIG.RECOVERY_DELAY);
        } else {
          // Final recovery attempt failed, give up
          cleanupTimer(contentId);
          self.postMessage({
            type: 'error',
            data: {
              contentId,
              message: `Timer failed after ${ERROR_RECOVERY_CONFIG.MAX_RECOVERY_ATTEMPTS} recovery attempts: ${
                recoveryError instanceof Error ? recoveryError.message : String(recoveryError)
              }`,
              code: 'RECOVERY_FAILED',
              retryCount: errorState.retryCount,
              recoveryAttempts: errorState.recoveryAttempts,
            },
          });
        }
      }
    }, ERROR_RECOVERY_CONFIG.RETRY_DELAY);
  } else {
    // Too many retries, give up
    cleanupTimer(contentId);
    self.postMessage({
      type: 'error',
      data: {
        contentId,
        message: `Timer failed after ${ERROR_RECOVERY_CONFIG.MAX_RETRIES} retries: ${error.message}`,
        code: 'MAX_RETRIES_EXCEEDED',
        retryCount: errorState.retryCount,
        recoveryAttempts: errorState.recoveryAttempts,
      },
    });
  }
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case 'startTimer':
        startTimer(data);
        break;
      case 'pauseTimer':
        pauseTimer(data.contentId);
        break;
      case 'resumeTimer':
        resumeTimer(data);
        break;
      case 'getStats': {
        const memoryInfo = performance.memory;
        self.postMessage({
          type: 'stats',
          data: {
            activeTimers: timers.size,
            totalProcessed: totalTimersProcessed,
            totalErrors,
            memoryUsage: memoryInfo?.usedJSHeapSize,
            memoryLimit: memoryInfo?.jsHeapSizeLimit,
            memoryThreshold: MEMORY_THRESHOLD,
            memoryHistory: memoryHistory,
            memoryTrend:
              memoryHistory.length > 1
                ? memoryHistory[memoryHistory.length - 1] - memoryHistory[0]
                : 0,
          },
        });
        break;
      }
      case 'cleanup':
        cleanupAll();
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    handleError(data?.contentId, error instanceof Error ? error : new Error('Unknown error'));
  }
};

// Handle worker termination
self.onclose = () => {
  cleanupAll();
};
