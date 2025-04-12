import { OfflineStorageService } from '@/services/OfflineStorageService';
import type { IOfflineContent } from '@/types/offline';
import type { IScheduledContent } from '@/types/content';

/**
 * Composable for accessing the OfflineStorageService
 * Provides methods for managing offline content
 */
export function useOfflineStorage() {
  const service = OfflineStorageService.getInstance();

  return {
    /**
     * Get all offline content items
     */
    getAllOfflineContent: (): IOfflineContent[] => {
      return service.getOfflineContent();
    },

    /**
     * Get a specific offline content item by ID
     */
    getOfflineContent: (id: string): IOfflineContent | undefined => {
      return service.getOfflineContentById(id);
    },

    /**
     * Store content for offline use
     */
    storeContent: (content: IScheduledContent): void => {
      service.storeContent(content);
    },

    /**
     * Update existing offline content
     */
    updateOfflineContent: (id: string, updates: Partial<IOfflineContent>): void => {
      service.updateOfflineContent(id, updates);
    },

    /**
     * Delete offline content
     */
    deleteOfflineContent: (id: string): void => {
      service.deleteOfflineContent(id);
    },

    /**
     * Add content to the sync queue
     */
    addToSyncQueue: (content: IOfflineContent) => {
      service.addToSyncQueue(content, 'create');
    },

    /**
     * Attempt to recover a failed content item
     */
    attemptRecovery: (id: string): Promise<boolean> => {
      return service.attemptRecovery(id);
    },

    /**
     * Resolve a sync conflict with local version
     */
    resolveConflictWithLocal: (id: string): void => {
      service.resolveConflictWithLocal(id);
    },

    /**
     * Resolve a sync conflict with server version
     */
    resolveConflictWithServer: (id: string): void => {
      service.resolveConflictWithServer(id);
    },

    /**
     * Get content with sync conflicts
     */
    getConflictingContent: (): IOfflineContent[] => {
      return service.getConflictingContent() as unknown as IOfflineContent[];
    },

    /**
     * Check if content is available offline
     */
    isContentAvailableOffline: (id: string): boolean => {
      return service.isContentAvailableOffline(id);
    },

    /**
     * Get sync status
     */
    getSyncStatus: (): { isSyncing: boolean; error: string | null } => {
      const status = service.getSyncStatus();
      return {
        isSyncing: status.isSyncing,
        error: status.error || null,
      };
    },

    /**
     * Clear all offline content
     */
    clearOfflineContent: (): void => {
      service.clearOfflineContent();
    },
  };
}
