/**
 * TimerService
 *
 * A service that manages countdown timers for scheduled content.
 * Handles timezone differences, offline support, and provides real-time updates.
 */

import { ref, computed, onUnmounted, onMounted, type Ref } from 'vue';
import { useNetworkStatus } from '@/composables/useNetworkStatus';
import { useUserStore } from '@/stores/userStore';
import { useConfigurationStore } from '@/stores/configuration';
import { OfflineStorageService, useOfflineStorage } from '@/services/OfflineStorageService';

export interface ITimer {
  contentId: string;
  publishAt: Date;
  remainingTime: Ref<{
    value: string;
    isOffline: boolean;
  }>;
  isOffline: Ref<boolean>;
  isExpired: Ref<boolean>;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export interface ITimerOptions {
  contentId: string;
  contentType: 'post' | 'comment';
  publishAt: Date;
  onComplete?: () => void;
  onTick?: (remainingTime: number) => void;
}

interface ITimerState {
  contentId: string;
  contentType: 'post' | 'comment';
  publishAt: Date;
  remainingTime: number;
  isActive: boolean;
  intervalId?: number;
  timezone: string;
}

export class TimerService {
  private static instance: TimerService;
  private timers: Map<string, ITimerState> = new Map();
  private intervals: Map<string, number> = new Map();
  private defaultUpdateInterval = 1000; // 1 second
  private networkStatus = useNetworkStatus();
  private userStore = useUserStore();
  private configStore = useConfigurationStore();
  private animationFrameIds: Map<string, number> = new Map();
  private offlineStorage = useOfflineStorage();

  private constructor() {
    // Private constructor to enforce singleton pattern
    this.setupNetworkListener();
    this.setupOfflineHandling();
    this.setupVisibilityChangeHandler();
    this.loadOfflineTimers();
  }

  /**
   * Get the singleton instance of TimerService
   */
  public static getInstance(): TimerService {
    if (!TimerService.instance) {
      TimerService.instance = new TimerService();
    }
    return TimerService.instance;
  }

  /**
   * Set up network status listener to handle offline/online transitions
   */
  private setupNetworkListener(): void {
    this.networkStatus.online.subscribe((isOnline: boolean) => {
      if (isOnline) {
        this.resumeAllTimers();
        this.syncOfflineTimers();
      } else {
        this.pauseAllTimers();
        this.saveTimersToOfflineStorage();
      }
    });
  }

  /**
   * Setup offline handling for timers
   * @private
   */
  private setupOfflineHandling(): void {
    // Handle going offline
    window.addEventListener('offline', () => {
      this.pauseAllTimers();
      this.saveTimersToOfflineStorage();
    });

    // Handle coming back online
    window.addEventListener('online', () => {
      this.resumeAllTimers();
      this.syncOfflineTimers();
    });
  }

  /**
   * Setup visibility change handler to pause/resume timers when tab is hidden/visible
   * @private
   */
  private setupVisibilityChangeHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAllTimers();
        this.saveTimersToOfflineStorage();
      } else {
        this.resumeAllTimers();
        this.syncOfflineTimers();
      }
    });
  }

  /**
   * Load timers from offline storage
   * @private
   */
  private loadOfflineTimers(): void {
    const offlineTimers = this.offlineStorage.getOfflineTimers();

    for (const timer of offlineTimers) {
      if (timer.isActive) {
        // Create a timer state
        const timerState: ITimerState = {
          contentId: timer.contentId,
          contentType: 'post', // Default to post, will be updated if needed
          publishAt: new Date(timer.publishAt),
          remainingTime: 0,
          isActive: navigator.onLine,
          intervalId: undefined,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        // Store the timer
        this.timers.set(timer.contentId, timerState);
      }
    }
  }

  /**
   * Save timers to offline storage
   * @private
   */
  private saveTimersToOfflineStorage(): void {
    for (const [contentId, timerState] of this.timers.entries()) {
      if (timerState.isActive) {
        this.offlineStorage.storeTimer(contentId, timerState.publishAt);
      }
    }
  }

  /**
   * Sync offline timers with the server
   * @private
   */
  private syncOfflineTimers(): void {
    // This would typically involve syncing with the server
    // For now, we'll just clear the offline timers
    const offlineTimers = this.offlineStorage.getOfflineTimers();

    for (const timer of offlineTimers) {
      // Check if the timer has expired
      const now = new Date();
      const publishDate = new Date(timer.publishAt);

      if (publishDate <= now) {
        // Timer has expired, mark it as inactive
        this.offlineStorage.updateOfflineTimer(timer.contentId, { isActive: false });
      }
    }
  }

  /**
   * Create a timer for content
   * @param contentId The ID of the content
   * @param publishAt The scheduled publication time
   * @returns ITimer The timer object
   */
  public createTimer(contentId: string, publishAt: Date): ITimer {
    // Get user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Create timer state
    const timerState: ITimerState = {
      contentId,
      contentType: 'post', // Default to post, will be updated if needed
      publishAt: new Date(publishAt),
      remainingTime: 0,
      isActive: navigator.onLine,
      intervalId: undefined,
      timezone,
    };

    // Store the timer
    this.timers.set(contentId, timerState);

    // Create reactive references
    const remainingTimeRef = ref<{ value: string; isOffline: boolean }>({
      value: '',
      isOffline: !navigator.onLine,
    });

    const isOfflineRef = ref(!navigator.onLine);
    const isExpiredRef = ref(false);

    // Start the timer
    this.startTimer({
      contentId,
      contentType: 'post',
      publishAt,
      onComplete: () => {
        isExpiredRef.value = true;
      },
      onTick: (remainingTime) => {
        remainingTimeRef.value = {
          value: this.formatRemainingTime(remainingTime),
          isOffline: !navigator.onLine,
        };
        isOfflineRef.value = !navigator.onLine;
      },
    });

    // Store in offline storage if offline
    if (!navigator.onLine) {
      this.offlineStorage.storeTimer(contentId, publishAt);
    }

    // Return the timer object
    return {
      contentId,
      publishAt,
      remainingTime: remainingTimeRef,
      isOffline: isOfflineRef,
      isExpired: isExpiredRef,
      pause: () => this.pauseTimer(contentId),
      resume: () => this.resumeTimer(contentId),
      reset: () => this.resetTimer(contentId),
    };
  }

  /**
   * Remove a timer
   * @param contentId The ID of the content
   */
  public removeTimer(contentId: string): void {
    this.stopTimer(contentId);
    this.timers.delete(contentId);

    // Clear any animation frame
    if (this.animationFrameIds.has(contentId)) {
      const frameId = this.animationFrameIds.get(contentId);
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }
      this.animationFrameIds.delete(contentId);
    }
  }

  /**
   * Reset a timer
   * @param contentId The ID of the content
   */
  public resetTimer(contentId: string): void {
    const timerState = this.timers.get(contentId);
    if (!timerState) return;

    // Stop the current timer
    this.stopTimer(contentId);

    // Start a new timer
    this.startTimer({
      contentId,
      contentType: timerState.contentType,
      publishAt: timerState.publishAt,
      onComplete: () => {
        // Handle completion
      },
      onTick: (remainingTime) => {
        // Handle tick
      },
    });
  }

  /**
   * Start a timer for content
   * @param options Timer options
   * @returns Ref<number> Reference to the remaining time
   */
  public startTimer(options: ITimerOptions): Ref<number> {
    const { contentId, contentType, publishAt, onComplete, onTick } = options;

    // Calculate initial remaining time
    const now = new Date();
    const publishDate = new Date(publishAt);
    const remainingTime = Math.max(0, publishDate.getTime() - now.getTime());

    // Create a reactive reference for the remaining time
    const remainingTimeRef = ref(remainingTime);

    // Check if we're online
    const isOnline = navigator.onLine;

    // Get user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Create timer state
    const timerState: ITimerState = {
      contentId,
      contentType,
      publishAt: publishDate,
      remainingTime,
      isActive: isOnline,
      intervalId: undefined,
      timezone,
    };

    // Store the timer
    this.timers.set(contentId, timerState);

    // Start the timer interval
    this.startTimerInterval(contentId, remainingTimeRef, onComplete, onTick);

    // Store in offline storage if offline
    if (!isOnline) {
      this.offlineStorage.storeTimer(contentId, publishDate);
    }

    return remainingTimeRef;
  }

  /**
   * Start a timer interval
   * @param contentId The content ID
   * @param remainingTimeRef The remaining time reference
   * @param onComplete The completion callback
   * @param onTick The tick callback
   * @private
   */
  private startTimerInterval(
    contentId: string,
    remainingTimeRef: Ref<number>,
    onComplete?: () => void,
    onTick?: (remainingTime: number) => void
  ): void {
    // Clear any existing interval
    this.stopTimer(contentId);

    // Check if we're online
    const isOnline = navigator.onLine;

    // If offline, use requestAnimationFrame for better performance
    if (!isOnline) {
      let lastTime = Date.now();

      const updateTimer = () => {
        const now = Date.now();
        const deltaTime = now - lastTime;
        lastTime = now;

        const timerState = this.timers.get(contentId);
        if (!timerState || !timerState.isActive) {
          return;
        }

        // Update remaining time
        const newRemainingTime = Math.max(0, timerState.remainingTime - deltaTime);
        timerState.remainingTime = newRemainingTime;
        remainingTimeRef.value = newRemainingTime;

        // Call onTick callback
        if (onTick) {
          onTick(newRemainingTime);
        }

        // Check if timer has expired
        if (newRemainingTime <= 0) {
          if (onComplete) {
            onComplete();
          }
          return;
        }

        // Schedule next update
        const frameId = requestAnimationFrame(updateTimer);
        this.animationFrameIds.set(contentId, frameId);
      };

      // Start the animation frame
      const frameId = requestAnimationFrame(updateTimer);
      this.animationFrameIds.set(contentId, frameId);
    } else {
      // Online mode - use setInterval
      const intervalId = window.setInterval(() => {
        const timerState = this.timers.get(contentId);
        if (!timerState || !timerState.isActive) {
          this.stopTimer(contentId);
          return;
        }

        // Calculate remaining time
        const now = new Date();
        const publishDate = new Date(timerState.publishAt);
        const newRemainingTime = Math.max(0, publishDate.getTime() - now.getTime());

        // Update remaining time
        timerState.remainingTime = newRemainingTime;
        remainingTimeRef.value = newRemainingTime;

        // Call onTick callback
        if (onTick) {
          onTick(newRemainingTime);
        }

        // Check if timer has expired
        if (newRemainingTime <= 0) {
          this.stopTimer(contentId);
          if (onComplete) {
            onComplete();
          }
        }
      }, this.defaultUpdateInterval);

      // Store the interval ID
      this.intervals.set(contentId, intervalId);
    }
  }

  /**
   * Stop a timer
   * @param contentId The content ID
   */
  public stopTimer(contentId: string): void {
    // Clear interval
    const intervalId = this.intervals.get(contentId);
    if (intervalId !== undefined) {
      clearInterval(intervalId);
      this.intervals.delete(contentId);
    }

    // Clear animation frame
    const frameId = this.animationFrameIds.get(contentId);
    if (frameId !== undefined) {
      cancelAnimationFrame(frameId);
      this.animationFrameIds.delete(contentId);
    }
  }

  /**
   * Pause a timer
   * @param contentId The content ID
   */
  public pauseTimer(contentId: string): void {
    const timerState = this.timers.get(contentId);
    if (!timerState) return;

    timerState.isActive = false;
    this.stopTimer(contentId);

    // Update offline storage
    if (!navigator.onLine) {
      this.offlineStorage.updateOfflineTimer(contentId, { isActive: false });
    }
  }

  /**
   * Resume a timer
   * @param contentId The content ID
   */
  public resumeTimer(contentId: string): void {
    const timerState = this.timers.get(contentId);
    if (!timerState) return;

    timerState.isActive = true;

    // Create a reactive reference for the remaining time
    const remainingTimeRef = ref(timerState.remainingTime);

    // Start the timer interval
    this.startTimerInterval(
      contentId,
      remainingTimeRef,
      () => {
        // Handle completion
      },
      (remainingTime) => {
        // Handle tick
      }
    );

    // Update offline storage
    if (!navigator.onLine) {
      this.offlineStorage.updateOfflineTimer(contentId, { isActive: true });
    }
  }

  /**
   * Pause all timers
   */
  public pauseAllTimers(): void {
    for (const [contentId] of this.timers.entries()) {
      this.pauseTimer(contentId);
    }
  }

  /**
   * Resume all timers
   */
  public resumeAllTimers(): void {
    for (const [contentId, timerState] of this.timers.entries()) {
      if (timerState.isActive) {
        this.resumeTimer(contentId);
      }
    }
  }

  /**
   * Get the content delay
   * @param contentId The content ID
   * @param contentType The content type
   * @returns Promise<number> The content delay
   */
  public async getContentDelay(
    contentId: string,
    contentType: 'post' | 'comment'
  ): Promise<number> {
    try {
      // Check if we're offline
      if (!navigator.onLine) {
        // Get from offline storage
        const offlineTimer = this.offlineStorage.getOfflineTimerById(contentId);
        if (offlineTimer) {
          const now = new Date();
          const publishDate = new Date(offlineTimer.publishAt);
          return Math.max(0, publishDate.getTime() - now.getTime());
        }

        // Default to 24 hours if not found
        return 24 * 60 * 60 * 1000;
      }

      // Online mode - get from server
      const response = await fetch(`/api/v1/content/${contentId}/delay`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get content delay');
      }

      const data = await response.json();
      return data.delay;
    } catch (error) {
      console.error('Error getting content delay:', error);
      // Default to 24 hours on error
      return 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Format remaining time as a string
   * @param remainingTime The remaining time in milliseconds
   * @returns string The formatted remaining time
   */
  public formatRemainingTime(remainingTime: number): string {
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get the publish date for content
   * @param contentId The content ID
   * @param contentType The content type
   * @returns Promise<Date> The publish date
   */
  public async getPublishDate(contentId: string, contentType: 'post' | 'comment'): Promise<Date> {
    try {
      // Check if we're offline
      if (!navigator.onLine) {
        // Get from offline storage
        const offlineTimer = this.offlineStorage.getOfflineTimerById(contentId);
        if (offlineTimer) {
          return new Date(offlineTimer.publishAt);
        }

        // Default to 24 hours from now if not found
        const now = new Date();
        now.setHours(now.getHours() + 24);
        return now;
      }

      // Online mode - get from server
      const response = await fetch(`/api/v1/content/${contentId}/publish-date`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get publish date');
      }

      const data = await response.json();
      return new Date(data.publishDate);
    } catch (error) {
      console.error('Error getting publish date:', error);
      // Default to 24 hours from now on error
      const now = new Date();
      now.setHours(now.getHours() + 24);
      return now;
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Clear all intervals
    for (const [contentId] of this.timers.entries()) {
      this.stopTimer(contentId);
    }

    // Clear all animation frames
    for (const [contentId, frameId] of this.animationFrameIds.entries()) {
      cancelAnimationFrame(frameId);
    }

    // Clear all timers
    this.timers.clear();
    this.intervals.clear();
    this.animationFrameIds.clear();
  }
}

/**
 * Composable to use the TimerService
 */
export function useTimerService(): TimerService {
  return TimerService.getInstance();
}
