/**
 * Background Timer Worker
 *
 * Handles timer processing in a separate thread to ensure accurate timing
 * even when the main thread is busy or the app is in the background.
 */

interface TimerData {
  contentId: string;
  publishAt: number;
  remainingTime: number;
}

interface TimerState {
  contentId: string;
  publishAt: number;
  remainingTime: number;
  intervalId: ReturnType<typeof setInterval>;
}

const timers = new Map<string, TimerState>();
const UPDATE_INTERVAL = 1000; // 1 second

/**
 * Start a new timer
 * @param data Timer data
 */
function startTimer(data: TimerData): void {
  const { contentId, publishAt, remainingTime } = data;

  // Clear existing timer if any
  if (timers.has(contentId)) {
    clearInterval(timers.get(contentId)?.intervalId);
  }

  // Create new timer
  const intervalId = setInterval(() => {
    const timer = timers.get(contentId);
    if (!timer) return;

    timer.remainingTime -= UPDATE_INTERVAL;

    // Send update to main thread
    self.postMessage({
      type: 'timerUpdate',
      data: {
        contentId,
        remainingTime: timer.remainingTime,
      },
    });

    // Check if timer is complete
    if (timer.remainingTime <= 0) {
      clearInterval(timer.intervalId);
      timers.delete(contentId);

      // Send completion message to main thread
      self.postMessage({
        type: 'timerComplete',
        data: { contentId },
      });
    }
  }, UPDATE_INTERVAL);

  // Store timer state
  timers.set(contentId, {
    contentId,
    publishAt,
    remainingTime,
    intervalId,
  });
}

/**
 * Pause a timer
 * @param contentId The content ID
 */
function pauseTimer(contentId: string): void {
  const timer = timers.get(contentId);
  if (!timer) return;

  clearInterval(timer.intervalId);
  timers.delete(contentId);
}

/**
 * Resume a timer
 * @param data Timer data
 */
function resumeTimer(data: TimerData): void {
  startTimer(data);
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
      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
