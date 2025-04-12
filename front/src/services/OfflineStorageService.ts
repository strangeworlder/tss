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
import type { IOfflineContent, IOfflineTimer, ISyncQueueItem } from '@/types/offline';
import { ScheduledContentStatusEnum } from '@/types/scheduling';
import { v4 as uuidv4 } from 'uuid';

// Re-export the types
export type { IOfflineContent, IOfflineTimer, ISyncQueueItem };

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private networkStatus = useNetworkStatus();
  private offlineContent: Ref<IOfflineContent[]> = ref([]);
  private offlineTimers: Ref<IOfflineTimer[]> = ref([]);
  private syncQueue = ref<ISyncQueueItem[]>([]);
  private isSyncing: Ref<boolean> = ref(false);
  private syncError: Ref<string | null> = ref(null);
  private retryDelay = 5000; // 5 seconds
  private maxRetryDelay = 300000; // 5 minutes
  private storage: Storage;
  private timers: Map<string, IOfflineTimer>;
  private syncInterval: number | null = null;
  private deviceId: string;
  private batchSize = 5; // Number of items to process in each batch
  private syncProgress: Ref<{ total: number; processed: number; failed: number }> = ref({
    total: 0,
    processed: 0,
    failed: 0,
  });
  private storageMonitorInterval: number | null = null;
  private maxStorageSize = 5 * 1024 * 1024; // 5MB
  private cleanupThreshold = 0.8; // 80% of max storage size
  private compressionEnabled = true;
  private syncStatus: Ref<{
    isOnline: boolean;
    lastSync: Date | null;
    nextSync: Date | null;
    queueSize: number;
    errorCount: number;
    conflictCount: number;
    storageUsage: number;
  }> = ref({
    isOnline: true,
    lastSync: null,
    nextSync: null,
    queueSize: 0,
    errorCount: 0,
    conflictCount: 0,
    storageUsage: 0,
  });

  private constructor() {
    this.storage = window.localStorage;
    this.timers = new Map();
    this.deviceId = this.getOrCreateDeviceId();
    this.loadFromLocalStorage();
    this.setupNetworkListener();
    this.initializeTimers();
    this.setupEventListeners();
    this.startSyncInterval();
    this.startStorageMonitor();
    this.updateSyncStatus();
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

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = window.setInterval(() => {
      if (this.networkStatus.online.value) {
        this.processSyncQueue();
      }
    }, 30000); // Check every 30 seconds
  }

  private updateSyncStatus(): void {
    this.syncStatus.value = {
      isOnline: this.networkStatus.online.value,
      lastSync: this.getLastSyncTime(),
      nextSync: this.getNextSyncTime(),
      queueSize: this.syncQueue.value.length,
      errorCount: this.syncQueue.value.filter((item) => item.status === 'failed').length,
      conflictCount: this.syncQueue.value.filter((item) => item.status === 'conflict').length,
      storageUsage: this.calculateStorageSize(),
    };
  }

  private getLastSyncTime(): Date | null {
    const lastSyncedItem = this.syncQueue.value
      .filter((item) => item.status === 'completed')
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0))[0];
    return lastSyncedItem?.updatedAt || null;
  }

  private getNextSyncTime(): Date | null {
    const nextItem = this.syncQueue.value
      .filter((item) => item.status === 'pending' || item.status === 'failed')
      .sort((a, b) => (a.nextAttempt?.getTime() || 0) - (b.nextAttempt?.getTime() || 0))[0];
    return nextItem?.nextAttempt || null;
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing.value) return;

    try {
      this.isSyncing.value = true;
      this.syncProgress.value = { total: 0, processed: 0, failed: 0 };
      this.updateSyncStatus();

      // Get all pending and failed items
      const queueItems = this.syncQueue.value
        .filter((item) => item.status === 'pending' || item.status === 'failed')
        .sort((a, b) => b.priority - a.priority);

      this.syncProgress.value.total = queueItems.length;

      // Process items in batches
      for (let i = 0; i < queueItems.length; i += this.batchSize) {
        const batch = queueItems.slice(i, i + this.batchSize);
        await Promise.all(
          batch.map(async (item) => {
            if (this.shouldProcessItem(item)) {
              try {
                await this.processQueueItem(item);
                this.syncProgress.value.processed++;
              } catch (error) {
                this.syncProgress.value.failed++;
                console.error(`Failed to process item ${item.id}:`, error);
              }
            }
          })
        );
        this.updateSyncStatus();
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
      this.syncError.value = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      this.isSyncing.value = false;
      this.updateSyncStatus();
      this.saveToLocalStorage();
    }
  }

  private shouldProcessItem(item: ISyncQueueItem): boolean {
    if (item.status === 'pending') return true;
    if (item.status === 'failed' && item.retryCount < item.maxRetries) {
      const now = new Date();
      return !item.nextAttempt || now >= item.nextAttempt;
    }
    return false;
  }

  private async processQueueItem(item: ISyncQueueItem): Promise<void> {
    try {
      item.status = 'processing';
      item.syncStatus = 'processing';
      item.lastAttempt = new Date();
      this.saveToLocalStorage();

      // Check for conflicts before processing
      const hasConflict = await this.checkForConflicts(item);
      if (hasConflict) {
        item.status = 'conflict';
        item.syncStatus = 'conflict';
        item.error = 'Version conflict detected';
        item.syncError = 'Version conflict detected';
        item.updatedAt = new Date();
        this.saveToLocalStorage();
        return;
      }

      // Simulate API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update item status based on result
      item.status = 'completed';
      item.syncStatus = 'completed';
      item.error = null;
      item.syncError = null;
      item.updatedAt = new Date();
      this.saveToLocalStorage();

      // Remove from queue if completed
      this.syncQueue.value = this.syncQueue.value.filter((i) => i.id !== item.id);
    } catch (error) {
      item.status = 'failed';
      item.syncStatus = 'failed';
      item.error = error instanceof Error ? error.message : 'Unknown error';
      item.syncError = item.error;
      item.retryCount++;
      item.lastRetryAt = new Date();
      item.nextAttempt = new Date(Date.now() + this.calculateRetryDelay(item.retryCount));
      item.updatedAt = new Date();
      this.saveToLocalStorage();

      // Add to recovery queue if max retries exceeded
      if (item.retryCount >= item.maxRetries) {
        this.addToRecoveryQueue(item);
      }
    }
  }

  private calculateRetryDelay(retryCount: number): number {
    return Math.min(this.retryDelay * 2 ** retryCount, this.maxRetryDelay);
  }

  /**
   * Add content to the sync queue
   * @param content The content to add
   * @param action The action to perform (create, update, delete)
   */
  public addToSyncQueue(content: IOfflineContent, action: 'create' | 'update' | 'delete'): void {
    const item: ISyncQueueItem = {
      id: content.id,
      contentId: content.id,
      type: content.type,
      action,
      data: content,
      status: 'pending',
      priority: this.calculatePriority(content),
      retryCount: 0,
      maxRetries: 3,
      lastAttempt: null,
      nextAttempt: null,
      lastRetryAt: null,
      error: null,
      version: content.version,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending',
      syncError: null,
      serverVersion: null,
      conflictResolution: null,
      metadata: {
        deviceId: this.deviceId,
        userId: content.authorId,
        timestamp: Date.now(),
      },
    };

    // Check if item already exists in queue
    const existingIndex = this.syncQueue.value.findIndex((i) => i.id === item.id);
    if (existingIndex !== -1) {
      this.syncQueue.value[existingIndex] = item;
    } else {
      this.syncQueue.value.push(item);
    }

    this.saveToLocalStorage();
  }

  private calculatePriority(content: IOfflineContent): number {
    // Higher priority for more recent content
    const ageInHours = (Date.now() - content.lastModified.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 100 - ageInHours);
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
      const storedContent = this.storage.getItem('offlineContent');
      if (storedContent) {
        this.offlineContent.value = this.decompressData(storedContent);
      }

      const storedTimers = this.storage.getItem('offlineTimers');
      if (storedTimers) {
        this.offlineTimers.value = this.decompressData(storedTimers);
      }

      const storedQueue = this.storage.getItem('syncQueue');
      if (storedQueue) {
        this.syncQueue.value = this.decompressData(storedQueue);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
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
      this.storage.setItem('offlineContent', this.compressData(this.offlineContent.value));
      this.storage.setItem('offlineTimers', this.compressData(this.offlineTimers.value));
      this.storage.setItem('syncQueue', this.compressData(this.syncQueue.value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
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
      status:
        content.status === 'draft'
          ? ScheduledContentStatusEnum.SCHEDULED
          : (content.status as ScheduledContentStatusEnum),
      authorId: content.authorId,
      version: 1, // Initial version
      hasActiveUpdate: false,
      lastModified: new Date(),
      syncStatus: 'pending',
      syncError: null,
      lastRetryAt: null,
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
   * Get the sync queue
   */
  public getSyncQueue(): ISyncQueueItem[] {
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
  private async checkForConflicts(item: ISyncQueueItem): Promise<boolean> {
    try {
      // Get the current server version of the content
      const serverContent = await this.fetchServerContent(item.contentId);

      if (!serverContent) {
        return false; // No conflict if content doesn't exist on server
      }

      // Check version conflicts
      if (serverContent.version > item.version) {
        item.serverVersion = serverContent.version;
        item.conflictResolution = null; // Reset any previous resolution
        return true;
      }

      // Check content conflicts
      if (this.hasContentConflict(item.data, serverContent)) {
        item.serverVersion = serverContent.version;
        item.conflictResolution = null;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking for conflicts:', error);
      return false;
    }
  }

  private hasContentConflict(
    localContent: IOfflineContent,
    serverContent: IOfflineContent
  ): boolean {
    // Compare critical fields that could cause conflicts
    return (
      localContent.content !== serverContent.content ||
      localContent.publishAt.getTime() !== serverContent.publishAt.getTime() ||
      localContent.status !== serverContent.status
    );
  }

  private async fetchServerContent(contentId: string): Promise<IOfflineContent | null> {
    try {
      // TODO: Replace with actual API call
      // This is a placeholder that simulates fetching content from the server
      return null;
    } catch (error) {
      console.error('Error fetching server content:', error);
      return null;
    }
  }

  /**
   * Resolve a conflict by choosing the local version
   * @param id The content ID
   */
  public resolveConflictWithLocal(id: string): void {
    const item = this.syncQueue.value.find((i) => i.id === id);
    if (!item) return;

    this.asyncResolveConflict(item, 'local');
  }

  /**
   * Resolve a conflict by choosing the server version
   * @param id The content ID
   */
  public resolveConflictWithServer(id: string): void {
    const item = this.syncQueue.value.find((i) => i.id === id);
    if (!item) return;

    this.asyncResolveConflict(item, 'server');
  }

  public resolveConflictWithMerge(id: string, mergedContent: IOfflineContent): void {
    const item = this.syncQueue.value.find((i) => i.id === id);
    if (!item) return;

    item.conflictResolution = 'manual';
    item.syncStatus = 'pending';
    item.data = mergedContent;
    item.version = Math.max(item.version, item.serverVersion || 0) + 1; // Increment version
    this.saveToLocalStorage();
    this.processSyncQueue();
  }

  /**
   * Get content with conflicts
   */
  public getConflictingContent(): ISyncQueueItem[] {
    return this.syncQueue.value.filter((item) => item.syncStatus === 'conflict');
  }

  /**
   * Get conflict details for a content item
   * @param id The content ID
   */
  public getConflictDetails(id: string): {
    local: IOfflineContent;
    server: IOfflineContent | null;
    resolution: 'local' | 'server' | 'manual' | null;
  } | null {
    const item = this.syncQueue.value.find((i) => i.id === id);
    if (!item || item.syncStatus !== 'conflict') return null;

    return {
      local: item.data,
      server: null, // TODO: Implement actual server content fetching
      resolution: item.conflictResolution,
    };
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
  public getSyncStatus(): {
    isOnline: boolean;
    lastSync: Date | null;
    nextSync: Date | null;
    queueSize: number;
    errorCount: number;
    conflictCount: number;
    storageUsage: number;
    isSyncing: boolean;
    progress: { total: number; processed: number; failed: number };
    error: string | null;
  } {
    return {
      ...this.syncStatus.value,
      isSyncing: this.isSyncing.value,
      progress: this.syncProgress.value,
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
    if (this.storageMonitorInterval) {
      clearInterval(this.storageMonitorInterval);
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.cleanupStorage();
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
  private addToRecoveryQueue(content: ISyncQueueItem): void {
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
  public getRecoveryQueue(): ISyncQueueItem[] {
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
      content.syncError = null;

      // Create an IOfflineContent from the recovered item
      const offlineContent: IOfflineContent = {
        id: content.id,
        type: content.type,
        content: content.data.content,
        publishAt: content.data.publishAt,
        authorId: content.data.authorId,
        status: content.data.status,
        version: content.version,
        hasActiveUpdate: content.data.hasActiveUpdate,
        lastModified: new Date(),
        syncStatus: 'pending',
        syncError: null,
        lastRetryAt: null,
        retryCount: 0,
        maxRetries: 3,
      };

      this.addToSyncQueue(offlineContent, 'update');
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
      lastRetry: content.lastRetryAt || undefined,
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
      syncStatus: 'pending',
      syncError: null,
      lastRetryAt: null,
    };

    // Update the content in the array
    this.offlineContent.value[contentIndex] = updatedContent;

    // Save to localStorage
    this.saveToLocalStorage();

    // Add to sync queue
    this.addToSyncQueue(updatedContent, 'update');
  }

  /**
   * Delete offline content
   * @param id The content ID
   */
  public deleteOfflineContent(id: string): void {
    const contentIndex = this.offlineContent.value.findIndex((item) => item.id === id);

    if (contentIndex === -1) {
      console.warn(`Cannot delete offline content: Content with ID ${id} not found`);
      return;
    }

    // Get the content before removing it
    const content = this.offlineContent.value[contentIndex];

    // Remove from offline content
    this.offlineContent.value.splice(contentIndex, 1);

    // Save to localStorage
    this.saveToLocalStorage();

    // Add to sync queue if content exists
    if (content) {
      // Create a new IOfflineContent object with the necessary properties
      const offlineContent: IOfflineContent = {
        id: content.id,
        type: content.type,
        content: content.content,
        publishAt: content.publishAt,
        authorId: content.authorId,
        status: content.status,
        version: content.version,
        hasActiveUpdate: content.hasActiveUpdate,
        lastModified: content.lastModified,
        syncStatus: 'pending',
        syncError: null,
        lastRetryAt: null,
        retryCount: 0,
        maxRetries: 3,
      };
      this.addToSyncQueue(offlineContent, 'delete');
    }
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
      this.addToSyncQueue(offlineContent, 'delete');
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

  public getSyncProgress(): { total: number; processed: number; failed: number } {
    return this.syncProgress.value;
  }

  private startStorageMonitor(): void {
    if (this.storageMonitorInterval) {
      clearInterval(this.storageMonitorInterval);
    }
    this.storageMonitorInterval = window.setInterval(() => {
      this.checkStorageUsage();
    }, 60000); // Check every minute
  }

  private checkStorageUsage(): void {
    try {
      const totalSize = this.calculateStorageSize();
      if (totalSize > this.maxStorageSize * this.cleanupThreshold) {
        this.cleanupStorage();
      }
    } catch (error) {
      console.error('Error monitoring storage usage:', error);
    }
  }

  private calculateStorageSize(): number {
    let totalSize = 0;
    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) {
          const value = this.storage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
          }
        }
      }
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
    return totalSize;
  }

  private cleanupStorage(): void {
    try {
      // Remove completed sync queue items
      this.syncQueue.value = this.syncQueue.value.filter(
        (item) => item.status !== 'completed' && item.status !== 'synced'
      );

      // Remove old offline content
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      this.offlineContent.value = this.offlineContent.value.filter(
        (content) => content.lastModified > thirtyDaysAgo
      );

      // Remove expired timers
      this.offlineTimers.value = this.offlineTimers.value.filter((timer) => timer.publishAt > now);

      this.saveToLocalStorage();
    } catch (error) {
      console.error('Error cleaning up storage:', error);
    }
  }

  private compressData(data: any): string {
    if (!this.compressionEnabled) {
      return JSON.stringify(data);
    }

    try {
      // Simple compression by removing unnecessary whitespace
      return JSON.stringify(data, null, 0);
    } catch (error) {
      console.error('Error compressing data:', error);
      return JSON.stringify(data);
    }
  }

  private decompressData(compressedData: string): any {
    try {
      return JSON.parse(compressedData);
    } catch (error) {
      console.error('Error decompressing data:', error);
      return null;
    }
  }

  public getStorageStats(): {
    totalSize: number;
    contentCount: number;
    queueSize: number;
    timerCount: number;
  } {
    return {
      totalSize: this.calculateStorageSize(),
      contentCount: this.offlineContent.value.length,
      queueSize: this.syncQueue.value.length,
      timerCount: this.offlineTimers.value.length,
    };
  }

  public getSyncStatusForContent(id: string): {
    status: string;
    error: string | null;
    lastAttempt: Date | null;
    nextAttempt: Date | null;
    retryCount: number;
  } | null {
    const item = this.syncQueue.value.find((i) => i.id === id);
    if (!item) return null;

    return {
      status: item.status,
      error: item.error,
      lastAttempt: item.lastAttempt,
      nextAttempt: item.nextAttempt,
      retryCount: item.retryCount,
    };
  }

  private async asyncResolveConflict(
    item: ISyncQueueItem,
    resolution: 'local' | 'server' | 'manual'
  ): Promise<void> {
    if (!item.conflictResolution) {
      item.conflictResolution = resolution;
      await this.saveToLocalStorage();
      this.updateSyncStatus();
    }
  }

  private async resolveConflict(item: ISyncQueueItem): Promise<void> {
    try {
      if (!item.conflictResolution) {
        // If no resolution is set, mark as manual resolution needed
        item.conflictResolution = 'manual';
        item.syncStatus = 'conflict';
        this.updateSyncQueueItem(item);
        return;
      }

      if (item.conflictResolution === 'manual') {
        // Wait for manual resolution
        return;
      }

      // Handle automatic resolution
      if (item.conflictResolution === 'local') {
        // Use local version
        item.syncStatus = 'pending';
        item.version = (item.serverVersion || 0) + 1;
        this.updateSyncQueueItem(item);
        await this.syncOfflineContent();
      } else if (item.conflictResolution === 'server') {
        // Use server version
        const serverContent = await this.fetchServerContent(item.contentId);
        if (serverContent) {
          item.data = serverContent;
          item.version = serverContent.version;
          item.syncStatus = 'pending';
          this.updateSyncQueueItem(item);
          await this.syncOfflineContent();
        } else {
          throw new Error('Failed to fetch server content');
        }
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      item.syncStatus = 'failed';
      item.syncError = error instanceof Error ? error.message : 'Unknown error';
      this.updateSyncQueueItem(item);
    }
  }

  private updateSyncQueueItem(item: ISyncQueueItem): void {
    const index = this.syncQueue.value.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      this.syncQueue.value[index] = item;
      this.saveToLocalStorage();
    }
  }
}

/**
 * Composable to use the OfflineStorageService
 */
export function useOfflineStorage(): OfflineStorageService {
  return OfflineStorageService.getInstance();
}
