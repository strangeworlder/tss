/**
 * BackgroundTimerService
 *
 * Handles timers during offline periods using a Web Worker.
 * This service ensures that timers continue to work even when the app is in the background
 * or when the device is offline.
 */

import { ref, onUnmounted } from 'vue';
import type { IOfflineContent } from '@/types/offline';
import type { ITimerState, ITimerStats, ITimerError, ITimerRecovery } from '@/types/timer';

interface IPersistenceConfig {
  enabled: boolean;
  storageKey: string;
  autoSaveInterval: number;
  maxStoredStates: number;
}

interface ITabSyncConfig {
  enabled: boolean;
  channelName: string;
  syncInterval: number;
  leaderElectionTimeout: number;
}

export class BackgroundTimerService {
  private worker: Worker;
  private timerStates = ref<Map<string, ITimerState>>(new Map());
  private errorHandler: ((error: ITimerError) => void) | null = null;
  private statsHandler: ((stats: ITimerStats) => void) | null = null;
  private cleanupHandler: ((message: string) => void) | null = null;
  private recoveryHandler: ((recovery: ITimerRecovery) => void) | null = null;
  private errorLog: ITimerError[] = [];
  private recoveryLog: ITimerRecovery[] = [];
  private stats = ref<ITimerStats>({
    activeTimers: 0,
    totalProcessed: 0,
    totalErrors: 0,
    memoryUsage: 0,
    memoryLimit: 0,
    memoryThreshold: 0.8,
    memoryHistory: [],
    memoryTrend: 0,
  });
  private memoryCheckInterval: number | null = null;
  private isCleaningUp = false;
  private persistenceConfig: IPersistenceConfig = {
    enabled: true,
    storageKey: 'timer_states',
    autoSaveInterval: 60000, // 1 minute
    maxStoredStates: 100,
  };
  private autoSaveInterval: number | null = null;
  private tabSyncConfig: ITabSyncConfig = {
    enabled: true,
    channelName: 'timer_sync_channel',
    syncInterval: 5000, // 5 seconds
    leaderElectionTimeout: 10000, // 10 seconds
  };
  private broadcastChannel: BroadcastChannel | null = null;
  private syncInterval: number | null = null;
  private isLeader = false;
  private leaderElectionTimeout: number | null = null;
  private lastLeaderPing = 0;
  private tabId = Math.random().toString(36).substring(2);

  constructor(config?: Partial<IPersistenceConfig & ITabSyncConfig>) {
    // Apply configuration
    if (config) {
      this.persistenceConfig = { ...this.persistenceConfig, ...config };
      this.tabSyncConfig = { ...this.tabSyncConfig, ...config };
    }

    // Create Web Worker
    this.worker = new Worker(new URL('./backgroundTimer.worker.ts', import.meta.url), {
      type: 'module',
    });

    // Handle worker messages
    this.worker.onmessage = this.handleWorkerMessage.bind(this);

    // Handle worker errors
    this.worker.onerror = (error) => {
      const timerError: ITimerError = {
        code: 'WORKER_ERROR',
        message: error.message,
        retryCount: 0,
        recoveryAttempts: 0,
      };
      this.handleError(timerError);
    };

    // Start memory monitoring
    this.startMemoryMonitoring();

    // Initialize persistence
    this.initializePersistence();

    // Initialize tab synchronization
    this.initializeTabSync();

    // Clean up on component unmount
    onUnmounted(() => {
      this.cleanup();
    });
  }

  /**
   * Initialize persistence
   */
  private initializePersistence(): void {
    if (!this.persistenceConfig.enabled) return;

    // Load saved states
    this.loadSavedStates();

    // Start auto-save interval
    this.startAutoSave();
  }

  /**
   * Load saved states from local storage
   */
  private loadSavedStates(): void {
    try {
      const savedStates = localStorage.getItem(this.persistenceConfig.storageKey);
      if (savedStates) {
        const states = JSON.parse(savedStates) as ITimerState[];
        for (const state of states) {
          // Only restore active timers
          if (state.status === 'running' || state.status === 'paused') {
            this.timerStates.value.set(state.contentId, state);
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved states:', error);
    }
  }

  /**
   * Save current states to local storage
   */
  private saveStates(): void {
    if (!this.persistenceConfig.enabled) return;

    try {
      const states = Array.from(this.timerStates.value.values());
      // Limit the number of stored states
      const limitedStates = states.slice(-this.persistenceConfig.maxStoredStates);
      localStorage.setItem(this.persistenceConfig.storageKey, JSON.stringify(limitedStates));
    } catch (error) {
      console.error('Error saving states:', error);
    }
  }

  /**
   * Start auto-save interval
   */
  private startAutoSave(): void {
    if (!this.persistenceConfig.enabled) return;

    this.autoSaveInterval = window.setInterval(() => {
      this.saveStates();
    }, this.persistenceConfig.autoSaveInterval);
  }

  /**
   * Stop auto-save interval
   */
  private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Update persistence configuration
   * @param config New configuration
   */
  updatePersistenceConfig(config: Partial<IPersistenceConfig>): void {
    const wasEnabled = this.persistenceConfig.enabled;
    this.persistenceConfig = { ...this.persistenceConfig, ...config };

    if (this.persistenceConfig.enabled && !wasEnabled) {
      this.initializePersistence();
    } else if (!this.persistenceConfig.enabled && wasEnabled) {
      this.stopAutoSave();
      localStorage.removeItem(this.persistenceConfig.storageKey);
    }
  }

  /**
   * Set error handler
   * @param handler Error handler function
   */
  setErrorHandler(handler: (error: ITimerError) => void): void {
    this.errorHandler = handler;
  }

  /**
   * Set stats handler
   * @param handler Stats handler function
   */
  setStatsHandler(handler: (stats: ITimerStats) => void): void {
    this.statsHandler = handler;
  }

  /**
   * Set cleanup handler
   * @param handler Cleanup handler function
   */
  setCleanupHandler(handler: (message: string) => void): void {
    this.cleanupHandler = handler;
  }

  /**
   * Set recovery handler
   * @param handler Recovery handler function
   */
  setRecoveryHandler(handler: (recovery: ITimerRecovery) => void): void {
    this.recoveryHandler = handler;
  }

  /**
   * Get error log
   * @returns Array of error logs
   */
  getErrorLog(): ITimerError[] {
    return this.errorLog;
  }

  /**
   * Get recovery log
   * @returns Array of recovery logs
   */
  getRecoveryLog(): ITimerRecovery[] {
    return this.recoveryLog;
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Clear recovery log
   */
  clearRecoveryLog(): void {
    this.recoveryLog = [];
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    // Check memory every minute
    this.memoryCheckInterval = window.setInterval(() => {
      this.getStats();
    }, 60000);
  }

  /**
   * Start a timer for content
   * @param content The content to start timer for
   */
  startTimer(content: IOfflineContent): void {
    if (this.isCleaningUp) {
      console.warn('Cannot start timer while cleanup is in progress');
      return;
    }

    if (!content.publishAt) return;

    const remainingTime = content.publishAt.getTime() - Date.now();
    if (remainingTime <= 0) return;

    // Send message to worker
    this.worker.postMessage({
      type: 'startTimer',
      data: {
        contentId: content.id,
        publishAt: content.publishAt.getTime(),
        remainingTime,
      },
    });

    // Update local state
    this.timerStates.value.set(content.id, {
      contentId: content.id,
      remainingTime,
      isActive: true,
    });
  }

  /**
   * Pause a timer
   * @param contentId The content ID
   */
  pauseTimer(contentId: string): void {
    if (this.isCleaningUp) {
      console.warn('Cannot pause timer while cleanup is in progress');
      return;
    }

    // Send message to worker
    this.worker.postMessage({
      type: 'pauseTimer',
      data: { contentId },
    });

    // Update local state
    const state = this.timerStates.value.get(contentId);
    if (state) {
      state.isActive = false;
    }
  }

  /**
   * Resume a timer
   * @param content The content to resume timer for
   */
  resumeTimer(content: IOfflineContent): void {
    if (this.isCleaningUp) {
      console.warn('Cannot resume timer while cleanup is in progress');
      return;
    }

    if (!content.publishAt) return;

    const remainingTime = content.publishAt.getTime() - Date.now();
    if (remainingTime <= 0) return;

    // Send message to worker
    this.worker.postMessage({
      type: 'resumeTimer',
      data: {
        contentId: content.id,
        publishAt: content.publishAt.getTime(),
        remainingTime,
      },
    });

    // Update local state
    this.timerStates.value.set(content.id, {
      contentId: content.id,
      remainingTime,
      isActive: true,
    });
  }

  /**
   * Get timer state
   * @param contentId The content ID
   * @returns Timer state or undefined if not found
   */
  getTimerState(contentId: string): ITimerState | undefined {
    return this.timerStates.value.get(contentId);
  }

  /**
   * Get all timer states
   * @returns Map of timer states
   */
  getTimerStates(): Map<string, ITimerState> {
    return this.timerStates.value;
  }

  /**
   * Get performance stats
   */
  getStats(): void {
    this.worker.postMessage({ type: 'getStats' });
  }

  /**
   * Initialize tab synchronization
   */
  private initializeTabSync(): void {
    if (!this.tabSyncConfig.enabled) return;

    // Create broadcast channel
    this.broadcastChannel = new BroadcastChannel(this.tabSyncConfig.channelName);

    // Handle incoming messages
    this.broadcastChannel.onmessage = this.handleSyncMessage.bind(this);

    // Start leader election
    this.startLeaderElection();

    // Start sync interval
    this.startSyncInterval();
  }

  /**
   * Start leader election
   */
  private startLeaderElection(): void {
    // Announce presence
    this.broadcastChannel?.postMessage({
      type: 'announce',
      tabId: this.tabId,
      timestamp: Date.now(),
    });

    // Set leader election timeout
    this.leaderElectionTimeout = window.setTimeout(() => {
      this.becomeLeader();
    }, this.tabSyncConfig.leaderElectionTimeout);
  }

  /**
   * Become leader
   */
  private becomeLeader(): void {
    this.isLeader = true;
    this.lastLeaderPing = Date.now();
    this.broadcastChannel?.postMessage({
      type: 'leader',
      tabId: this.tabId,
      timestamp: Date.now(),
    });
  }

  /**
   * Start sync interval
   */
  private startSyncInterval(): void {
    this.syncInterval = window.setInterval(() => {
      if (this.isLeader) {
        // Leader sends state updates
        this.broadcastChannel?.postMessage({
          type: 'stateUpdate',
          tabId: this.tabId,
          timestamp: Date.now(),
          states: Array.from(this.timerStates.value.entries()),
        });
      } else {
        // Non-leader checks for leader
        if (Date.now() - this.lastLeaderPing > this.tabSyncConfig.leaderElectionTimeout) {
          this.startLeaderElection();
        }
      }
    }, this.tabSyncConfig.syncInterval);
  }

  /**
   * Handle sync message
   * @param event Message event
   */
  private handleSyncMessage(event: MessageEvent): void {
    const { type, tabId, timestamp, states } = event.data;

    switch (type) {
      case 'announce':
        // If we're leader, respond
        if (this.isLeader) {
          this.broadcastChannel?.postMessage({
            type: 'leader',
            tabId: this.tabId,
            timestamp: Date.now(),
          });
        }
        break;

      case 'leader':
        // Clear leader election timeout
        if (this.leaderElectionTimeout) {
          clearTimeout(this.leaderElectionTimeout);
          this.leaderElectionTimeout = null;
        }

        // Update leader ping
        this.lastLeaderPing = timestamp;
        this.isLeader = false;
        break;

      case 'stateUpdate':
        // Only accept updates from leader
        if (this.lastLeaderPing === timestamp) {
          // Update states
          this.timerStates.value = new Map(states);
        }
        break;
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.isCleaningUp) return;
    this.isCleaningUp = true;

    try {
      // Stop auto-save
      this.stopAutoSave();

      // Stop sync interval
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }

      // Stop leader election timeout
      if (this.leaderElectionTimeout) {
        clearTimeout(this.leaderElectionTimeout);
        this.leaderElectionTimeout = null;
      }

      // Close broadcast channel
      if (this.broadcastChannel) {
        this.broadcastChannel.close();
        this.broadcastChannel = null;
      }

      // Save final states
      this.saveStates();

      // Clear memory check interval
      if (this.memoryCheckInterval) {
        clearInterval(this.memoryCheckInterval);
        this.memoryCheckInterval = null;
      }

      // Send cleanup message to worker
      this.worker.postMessage({ type: 'cleanup' });

      // Clear local state
      this.timerStates.value.clear();
      this.stats.value = {
        activeTimers: 0,
        totalProcessed: 0,
        totalErrors: 0,
        memoryUsage: 0,
        memoryLimit: 0,
        memoryThreshold: 0.8,
        memoryHistory: [],
        memoryTrend: 0,
      };

      // Terminate worker
      this.worker.terminate();
    } catch (error) {
      console.error('Error during cleanup:', error);
      this.errorHandler?.({
        message: `Cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'CLEANUP_ERROR',
        contentId: 'system',
      });
    } finally {
      this.isCleaningUp = false;
    }
  }

  /**
   * Handle worker messages
   * @param event Message event
   */
  private handleWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;

    switch (type) {
      case 'timerUpdate':
        this.handleTimerUpdate(data);
        break;
      case 'timerComplete':
        this.handleTimerComplete(data);
        break;
      case 'timerCleaned':
        this.handleTimerCleaned(data);
        break;
      case 'cleanupComplete':
        this.handleCleanupComplete(data);
        break;
      case 'error':
        this.handleError(data);
        break;
      case 'stats':
        this.handleStats(data);
        break;
      case 'recoverySuccess':
        this.handleRecoverySuccess(data);
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  /**
   * Handle timer update
   * @param data Update data
   */
  private handleTimerUpdate(data: {
    contentId: string;
    remainingTime: number;
    priority: number;
  }): void {
    const state = this.timerStates.value.get(data.contentId);
    if (state) {
      state.remainingTime = data.remainingTime;
    }
  }

  /**
   * Handle timer completion
   * @param data Completion data
   */
  private handleTimerComplete(data: { contentId: string }): void {
    this.timerStates.value.delete(data.contentId);
  }

  /**
   * Handle timer cleaned
   * @param data Cleanup data
   */
  private handleTimerCleaned(data: { contentId: string; message: string }): void {
    this.timerStates.value.delete(data.contentId);
    this.cleanupHandler?.(`Timer ${data.contentId} cleaned up: ${data.message}`);
  }

  /**
   * Handle cleanup complete
   * @param data Cleanup data
   */
  private handleCleanupComplete(data: { message: string; totalCleaned: number }): void {
    this.cleanupHandler?.(
      `Cleanup complete: ${data.message} (${data.totalCleaned} timers cleaned)`
    );
  }

  /**
   * Handle error
   * @param error Error data
   */
  private handleError(error: ITimerError): void {
    // Add to error log
    this.errorLog.push(error);

    // Update stats
    this.stats.value.totalErrors++;

    // Notify error handler
    this.errorHandler?.(error);

    // Log error to console
    console.error('Timer error:', error);

    // If contentId is provided, update timer state
    if (error.contentId) {
      const state = this.timerStates.value.get(error.contentId);
      if (state) {
        state.status = 'error';
        state.error = error;
      }
    }
  }

  /**
   * Handle stats
   * @param data Stats data
   */
  private handleStats(data: ITimerStats): void {
    this.stats.value = data;
    this.statsHandler?.(data);
  }

  /**
   * Handle recovery success
   * @param recovery Recovery data
   */
  private handleRecoverySuccess(recovery: ITimerRecovery): void {
    // Add to recovery log
    this.recoveryLog.push(recovery);

    // Update timer state
    const state = this.timerStates.value.get(recovery.contentId);
    if (state) {
      state.status = 'running';
      state.error = undefined;
    }

    // Notify recovery handler
    this.recoveryHandler?.(recovery);

    // Log recovery to console
    console.log('Timer recovered:', recovery);
  }
}

/**
 * Composable function to use the BackgroundTimerService
 * @returns BackgroundTimerService instance
 */
export function useBackgroundTimer() {
  const service = new BackgroundTimerService();

  // Clean up on component unmount
  onUnmounted(() => {
    service.cleanup();
  });

  return service;
}
