/**
 * OfflineStorageService
 *
 * Handles storing and retrieving content when offline, and synchronizing
 * when the user comes back online.
 */

import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import { useNetworkStatus } from '@/composables/useNetworkStatus';
import type { IScheduledContent } from '@/types/content';
import type { IOfflineContent, IOfflineTimer } from '@/types/offline';
import { ScheduledContentStatusEnum } from '@/types/scheduling';

export type { IOfflineContent, IOfflineTimer };

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private networkStatus = useNetworkStatus();
  private offlineContent: Ref<IOfflineContent[]> = ref([]);
  private offlineTimers: Ref<IOfflineTimer[]> = ref([]);
  private syncQueue: Ref<IOfflineContent[]> = ref([]);
  private isSyncing: Ref<boolean> = ref(false);
  private syncError: Ref<string | null> = ref(null);
  private retryDelay = 5000; // 5 seconds
  private maxRetryDelay = 300000; // 5 minutes
  private storage: Storage;
  private timers: Map<string, IOfflineTimer>;

  private constructor() {
    this.storage = window.localStorage;
    this.timers = new Map();
    this.loadFromLocalStorage();
    this.setupNetworkListener();
    this.initializeTimers();
    this.setupEventListeners();
  }

  /**
   * Get the singleton instance of OfflineStorageService
   */
  public static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  /**
   * Get all active timers
   * @private
   */
  private getActiveTimers(): IOfflineTimer[] {
    return this.offlineTimers.value.filter((timer) => timer.isActive);
  }

  /**
   * Start a timer for a specific content
   * @param contentId The content ID
   * @param publishAt The publish date
   * @private
   */
  private startTimer(contentId: string, publishAt: Date): void {
    this.storeTimer(contentId, publishAt);
  }

  private initializeTimers(): void {
    const activeTimers = this.getActiveTimers();
    for (const timer of activeTimers) {
      this.startTimer(timer.contentId, timer.publishAt);
    }
  }

  /**
   * Set up network status listener to handle offline/online transitions
   * @private
   */
  private setupNetworkListener(): void {
    this.networkStatus.online.subscribe((isOnline: boolean) => {
      if (isOnline) {
        this.syncOfflineContent();
      }
    });
  }

  /**
   * Load offline content from localStorage
   * @private
   */
  private loadFromLocalStorage(): void {
    try {
      const storedContent = localStorage.getItem('offlineContent');
      if (storedContent) {
        this.offlineContent.value = JSON.parse(storedContent).map((item: any) => ({
          ...item,
          publishAt: new Date(item.publishAt),
          lastModified: new Date(item.lastModified),
          lastRetryAt: item.lastRetryAt ? new Date(item.lastRetryAt) : undefined,
          retryCount: item.retryCount ?? 0,
          maxRetries: item.maxRetries ?? 3,
        }));
      }

      const storedTimers = localStorage.getItem('offlineTimers');
      if (storedTimers) {
        this.offlineTimers.value = JSON.parse(storedTimers).map((item: any) => ({
          ...item,
          publishAt: new Date(item.publishAt),
          lastUpdated: new Date(item.lastUpdated),
        }));
      }

      const storedQueue = localStorage.getItem('syncQueue');
      if (storedQueue) {
        this.syncQueue.value = JSON.parse(storedQueue).map((item: any) => ({
          ...item,
          publishAt: new Date(item.publishAt),
          lastModified: new Date(item.lastModified),
          lastRetryAt: item.lastRetryAt ? new Date(item.lastRetryAt) : undefined,
          retryCount: item.retryCount ?? 0,
          maxRetries: item.maxRetries ?? 3,
        }));
      }
    } catch (error) {
      console.error('Error loading offline content:', error);
      this.offlineContent.value = [];
      this.offlineTimers.value = [];
      this.syncQueue.value = [];
    }
  }

  /**
   * Save offline content to localStorage
   * @private
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('offlineContent', JSON.stringify(this.offlineContent.value));
      localStorage.setItem('offlineTimers', JSON.stringify(this.offlineTimers.value));
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue.value));
    } catch (error) {
      console.error('Error saving offline content:', error);
    }
  }

  /**
   * Store content for offline use
   * @param content The content to store
   */
  public storeContent(content: IScheduledContent): void {
    const existingIndex = this.offlineContent.value.findIndex((item) => item.id === content.id);

    const offlineContent: IOfflineContent = {
      id: content.id,
      type: 'post', // Default to post, can be updated later if needed
      content: content.content,
      publishAt: new Date(content.publishAt),
      status: content.status === 'draft' ? ScheduledContentStatusEnum.SCHEDULED : content.status,
      authorId: content.authorId,
      version: 1, // Initial version
      hasActiveUpdate: false,
      lastModified: new Date(),
      syncStatus: 'pending',
      retryCount: 0,
      maxRetries: 3,
    };

    if (existingIndex !== -1) {
      this.offlineContent.value[existingIndex] = offlineContent;
    } else {
      this.offlineContent.value.push(offlineContent);
    }

    this.saveToLocalStorage();
  }

  /**
   * Get all offline content
   */
  public getOfflineContent(): IOfflineContent[] {
    return this.offlineContent.value;
  }

  /**
   * Get offline content by ID
   * @param id The content ID
   */
  public getOfflineContentById(id: string): IOfflineContent | undefined {
    return this.offlineContent.value.find((item) => item.id === id);
  }

  /**
   * Store a timer for offline use
   * @param contentId The content ID
   * @param publishAt The publish date
   */
  public storeTimer(contentId: string, publishAt: Date): void {
    const timer: IOfflineTimer = {
      contentId,
      publishAt,
      isActive: true,
      lastUpdated: new Date(),
    };

    const timers = this.getOfflineTimers();
    timers.push(timer);
    localStorage.setItem('offlineTimers', JSON.stringify(timers));

    // Emit event for BackgroundTimerService to handle
    window.dispatchEvent(
      new CustomEvent('timer:start', {
        detail: { contentId, publishAt },
      })
    );
  }

  /**
   * Get all offline timers
   */
  public getOfflineTimers(): IOfflineTimer[] {
    return this.offlineTimers.value;
  }

  /**
   * Get offline timer by content ID
   * @param contentId The content ID
   */
  public getOfflineTimerById(contentId: string): IOfflineTimer | undefined {
    return this.offlineTimers.value.find((item) => item.contentId === contentId);
  }

  /**
   * Update an offline timer
   * @param contentId The content ID
   * @param updates The updates to apply
   */
  public updateOfflineTimer(contentId: string, updates: Partial<IOfflineTimer>): void {
    const existingIndex = this.offlineTimers.value.findIndex(
      (item) => item.contentId === contentId
    );

    if (existingIndex !== -1) {
      this.offlineTimers.value[existingIndex] = {
        ...this.offlineTimers.value[existingIndex],
        ...updates,
        lastUpdated: new Date(),
      };
      this.saveToLocalStorage();
    }
  }

  /**
   * Add content to the sync queue
   * @param content The content to sync
   */
  public addToSyncQueue(content: IOfflineContent): void {
    const existingIndex = this.syncQueue.value.findIndex((item) => item.id === content.id);

    if (existingIndex !== -1) {
      this.syncQueue.value[existingIndex] = content;
    } else {
      this.syncQueue.value.push(content);
    }

    this.saveToLocalStorage();
  }

  /**
   * Get the sync queue
   */
  public getSyncQueue(): IOfflineContent[] {
    return this.syncQueue.value;
  }

  /**
   * Remove content from the sync queue
   * @param id The content ID
   */
  public removeFromSyncQueue(id: string): void {
    this.syncQueue.value = this.syncQueue.value.filter((item) => item.id !== id);
    this.saveToLocalStorage();
  }

  /**
   * Calculate retry delay with exponential backoff
   * @param retryCount The number of retries
   * @private
   */
  private calculateRetryDelay(retryCount: number): number {
    const delay = Math.min(this.retryDelay * 2 ** retryCount, this.maxRetryDelay);
    return delay;
  }

  /**
   * Sync offline content with the server
   */
  public async syncOfflineContent(): Promise<void> {
    if (this.isSyncing.value || !navigator.onLine || this.syncQueue.value.length === 0) {
      return;
    }

    this.isSyncing.value = true;
    this.syncError.value = null;

    try {
      // Process each item in the sync queue
      for (const item of this.syncQueue.value) {
        try {
          // Check if we should retry based on retry count and delay
          if (item.retryCount > 0) {
            const lastRetry = item.lastRetryAt?.getTime() ?? 0;
            const retryDelay = this.calculateRetryDelay(item.retryCount - 1);
            const timeSinceLastRetry = Date.now() - lastRetry;

            if (timeSinceLastRetry < retryDelay) {
              continue; // Skip this item for now
            }
          }

          // Check for conflicts before syncing
          const hasConflict = await this.checkForConflicts(item);

          if (hasConflict) {
            // Mark as conflict and continue to next item
            const index = this.syncQueue.value.findIndex((i) => i.id === item.id);
            if (index !== -1) {
              this.syncQueue.value[index].syncStatus = 'conflict';
              this.syncQueue.value[index].syncError = 'Version conflict detected';
            }
            continue;
          }

          // Update the sync status
          const index = this.syncQueue.value.findIndex((i) => i.id === item.id);
          if (index !== -1) {
            this.syncQueue.value[index].syncStatus = 'synced';
          }

          // Remove from offline content
          this.offlineContent.value = this.offlineContent.value.filter((i) => i.id !== item.id);

          // Remove from offline timers
          this.offlineTimers.value = this.offlineTimers.value.filter(
            (i) => i.contentId !== item.id
          );

          // Save changes
          this.saveToLocalStorage();
        } catch (error) {
          this.handleSyncError(error, item.id);
        }
      }

      // Remove successfully synced items from the queue
      this.syncQueue.value = this.syncQueue.value.filter(
        (item) =>
          item.syncStatus === 'pending' ||
          item.syncStatus === 'failed' ||
          item.syncStatus === 'conflict'
      );
      this.saveToLocalStorage();
    } catch (error) {
      console.error('Error syncing offline content:', error);
      this.syncError.value =
        error instanceof Error ? error.message : 'Unknown error occurred during sync';
    } finally {
      this.isSyncing.value = false;
    }
  }

  /**
   * Check for conflicts between offline and server content
   * @param item The offline content to check
   * @private
   */
  private async checkForConflicts(item: IOfflineContent): Promise<boolean> {
    try {
      // This would be replaced with an actual API call to check the server version
      // For now, we'll simulate a conflict check
      const serverVersion = await this.fetchServerVersion(item.id);

      // Update the item with the server version
      const index = this.syncQueue.value.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        this.syncQueue.value[index].serverVersion = serverVersion;
      }

      // If server version is higher than local version, we have a conflict
      return serverVersion > item.version;
    } catch (error) {
      console.error(`Error checking for conflicts for item ${item.id}:`, error);
      return false; // Assume no conflict on error
    }
  }

  /**
   * Fetch the server version of content
   * @param id The content ID
   * @private
   */
  private async fetchServerVersion(id: string): Promise<number> {
    // This would be replaced with an actual API call
    // For now, we'll simulate a server response
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate a random server version that might be higher than local
        const randomVersion = Math.floor(Math.random() * 5) + 1;
        resolve(randomVersion);
      }, 100);
    });
  }

  /**
   * Resolve a conflict by choosing the local version
   * @param id The content ID
   */
  public resolveConflictWithLocal(id: string): void {
    const index = this.syncQueue.value.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.syncQueue.value[index].conflictResolution = 'local';
      this.syncQueue.value[index].syncStatus = 'pending';
      this.saveToLocalStorage();
    }
  }

  /**
   * Resolve a conflict by choosing the server version
   * @param id The content ID
   */
  public resolveConflictWithServer(id: string): void {
    const index = this.syncQueue.value.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.syncQueue.value[index].conflictResolution = 'server';
      // Remove from queue as we're using the server version
      this.syncQueue.value = this.syncQueue.value.filter((i) => i.id !== id);
      this.saveToLocalStorage();
    }
  }

  /**
   * Get content with conflicts
   */
  public getConflictingContent(): IOfflineContent[] {
    return this.syncQueue.value.filter((item) => item.syncStatus === 'conflict');
  }

  /**
   * Check if content is available offline
   * @param id The content ID
   */
  public isContentAvailableOffline(id: string): boolean {
    return this.offlineContent.value.some((item) => item.id === id);
  }

  /**
   * Get the sync status
   */
  public getSyncStatus(): { isSyncing: boolean; error: string | null } {
    return {
      isSyncing: this.isSyncing.value,
      error: this.syncError.value,
    };
  }

  /**
   * Clear all offline content
   */
  public clearOfflineContent(): void {
    this.offlineContent.value = [];
    this.offlineTimers.value = [];
    this.syncQueue.value = [];
    this.saveToLocalStorage();
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Cleanup is now handled by event listeners
  }

  /**
   * Handle errors during sync operations
   * @param error The error that occurred
   * @param contentId The content ID that caused the error
   * @private
   */
  private handleSyncError(error: unknown, contentId: string): void {
    console.error(`Error syncing content ${contentId}:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const index = this.syncQueue.value.findIndex((i) => i.id === contentId);

    if (index !== -1) {
      const content = this.syncQueue.value[index];
      content.syncStatus = 'failed';
      content.syncError = errorMessage;
      content.retryCount += 1;
      content.lastRetryAt = new Date();

      // If max retries exceeded, mark for manual intervention
      if (content.retryCount >= content.maxRetries) {
        content.syncError = `Max retries (${content.maxRetries}) exceeded. Manual intervention required.`;
        this.addToRecoveryQueue(content);
      }
    }

    this.saveToLocalStorage();
  }

  /**
   * Add content to the recovery queue for manual intervention
   * @param content The content to add to recovery
   * @private
   */
  private addToRecoveryQueue(content: IOfflineContent): void {
    // Store in a separate recovery queue in localStorage
    try {
      const recoveryQueue = this.getRecoveryQueue();
      recoveryQueue.push(content);
      localStorage.setItem('recoveryQueue', JSON.stringify(recoveryQueue));
    } catch (error) {
      console.error('Error adding to recovery queue:', error);
    }
  }

  /**
   * Get the recovery queue
   */
  public getRecoveryQueue(): IOfflineContent[] {
    try {
      const storedQueue = localStorage.getItem('recoveryQueue');
      if (storedQueue) {
        return JSON.parse(storedQueue).map((item: any) => ({
          ...item,
          publishAt: new Date(item.publishAt),
          lastModified: new Date(item.lastModified),
          lastRetryAt: item.lastRetryAt ? new Date(item.lastRetryAt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Error getting recovery queue:', error);
    }
    return [];
  }

  /**
   * Remove content from the recovery queue
   * @param id The content ID
   */
  public removeFromRecoveryQueue(id: string): void {
    try {
      const recoveryQueue = this.getRecoveryQueue();
      const updatedQueue = recoveryQueue.filter((item) => item.id !== id);
      localStorage.setItem('recoveryQueue', JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Error removing from recovery queue:', error);
    }
  }

  /**
   * Attempt to recover a failed sync operation
   * @param id The content ID
   */
  public async attemptRecovery(id: string): Promise<boolean> {
    const recoveryQueue = this.getRecoveryQueue();
    const content = recoveryQueue.find((item) => item.id === id);

    if (!content) {
      return false;
    }

    try {
      // Reset retry count and add back to sync queue
      content.retryCount = 0;
      content.syncStatus = 'pending';
      content.syncError = undefined;

      this.addToSyncQueue(content);
      this.removeFromRecoveryQueue(id);

      // Attempt sync immediately
      await this.syncOfflineContent();

      return true;
    } catch (error) {
      console.error(`Error recovering content ${id}:`, error);
      return false;
    }
  }

  /**
   * Get error details for a content item
   * @param id The content ID
   */
  public getErrorDetails(
    id: string
  ): { error: string; retryCount: number; lastRetry: Date | undefined } | null {
    const content =
      this.syncQueue.value.find((item) => item.id === id) ||
      this.getRecoveryQueue().find((item) => item.id === id);

    if (!content || content.syncStatus !== 'failed') {
      return null;
    }

    return {
      error: content.syncError || 'Unknown error',
      retryCount: content.retryCount,
      lastRetry: content.lastRetryAt,
    };
  }

  /**
   * Update offline content
   * @param id The content ID
   * @param updates The content updates
   */
  public updateOfflineContent(id: string, updates: Partial<IOfflineContent>): void {
    const contentIndex = this.offlineContent.value.findIndex((item) => item.id === id);

    if (contentIndex === -1) {
      console.warn(`Cannot update offline content: Content with ID ${id} not found`);
      return;
    }

    // Create a new content object with the updates
    const updatedContent: IOfflineContent = {
      ...this.offlineContent.value[contentIndex],
      ...updates,
      lastModified: new Date(),
      syncStatus: 'pending', // Reset sync status when content is updated
    };

    // Update the content in the array
    this.offlineContent.value[contentIndex] = updatedContent;

    // Save to localStorage
    this.saveToLocalStorage();

    // If the content is in the sync queue, update it there too
    const queueIndex = this.syncQueue.value.findIndex((item) => item.id === id);
    if (queueIndex !== -1) {
      this.syncQueue.value[queueIndex] = updatedContent;
    }

    // If the content is in the recovery queue, update it there too
    const recoveryIndex = this.getRecoveryQueue().findIndex((item) => item.id === id);
    if (recoveryIndex !== -1) {
      this.getRecoveryQueue()[recoveryIndex] = updatedContent;
    }
  }

  /**
   * Delete offline content
   * @param id The content ID
   */
  public deleteOfflineContent(id: string): void {
    // Remove from offline content
    this.offlineContent.value = this.offlineContent.value.filter((item) => item.id !== id);

    // Remove from sync queue
    this.syncQueue.value = this.syncQueue.value.filter((item) => item.id !== id);

    // Remove from recovery queue
    const recoveryQueue = this.getRecoveryQueue();
    const updatedRecoveryQueue = recoveryQueue.filter((item) => item.id !== id);

    // Remove timer
    this.offlineTimers.value = this.offlineTimers.value.filter((item) => item.contentId !== id);

    // Save to localStorage
    this.saveToLocalStorage();

    // Emit event to stop the timer
    window.dispatchEvent(
      new CustomEvent('timer:stop', {
        detail: { contentId: id },
      })
    );
  }

  private setupEventListeners(): void {
    window.addEventListener('timer:complete', ((event: CustomEvent) => {
      const { contentId } = event.detail;
      this.handleTimerComplete(contentId);
    }) as EventListener);
  }

  private handleTimerComplete(contentId: string): void {
    const offlineContent = this.getOfflineContentById(contentId);
    if (offlineContent) {
      this.addToSyncQueue(offlineContent);
      this.removeOfflineTimer(contentId);
    }
  }

  public removeOfflineTimer(contentId: string): void {
    const timers = this.getOfflineTimers();
    const updatedTimers = timers.filter((timer) => timer.contentId !== contentId);
    localStorage.setItem('offlineTimers', JSON.stringify(updatedTimers));

    // Emit event for BackgroundTimerService to handle
    window.dispatchEvent(
      new CustomEvent('timer:stop', {
        detail: { contentId },
      })
    );
  }
}

/**
 * Composable to use the OfflineStorageService
 */
export function useOfflineStorage(): OfflineStorageService {
  return OfflineStorageService.getInstance();
}
