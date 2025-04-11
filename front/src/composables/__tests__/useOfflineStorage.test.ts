import { describe, it, expect, beforeEach, vi } from '@/test-utils';
import { useOfflineStorage } from '../useOfflineStorage';
import type { IOfflineContent } from '@/services/OfflineStorageService';
import { ScheduledContentStatusEnum } from '@/types/scheduling';

// Mock the OfflineStorageService
vi.mock('@/services/OfflineStorageService', () => {
  const mockContent: IOfflineContent = {
    id: 'test-id',
    type: 'post',
    content: 'Test content',
    publishAt: new Date('2023-12-31T12:00:00Z'),
    status: ScheduledContentStatusEnum.SCHEDULED,
    authorId: 'author-id',
    version: 1,
    hasActiveUpdate: false,
    lastModified: new Date(),
    syncStatus: 'pending',
    retryCount: 0,
    maxRetries: 3,
  };

  return {
    OfflineStorageService: vi.fn().mockImplementation(() => ({
      getAllOfflineContent: vi.fn().mockReturnValue([mockContent]),
      getOfflineContent: vi.fn().mockReturnValue(mockContent),
      addOfflineContent: vi.fn().mockImplementation((content) => ({
        ...content,
        id: 'new-id',
      })),
      updateOfflineContent: vi.fn().mockImplementation((id, content) => ({
        ...mockContent,
        ...content,
        id,
      })),
      deleteOfflineContent: vi.fn(),
      retrySync: vi.fn(),
      resolveConflict: vi.fn(),
    })),
  };
});

describe('useOfflineStorage', () => {
  let offlineStorage: ReturnType<typeof useOfflineStorage>;

  beforeEach(() => {
    offlineStorage = useOfflineStorage();
    vi.clearAllMocks();
  });

  it('returns all offline content', () => {
    const content = offlineStorage.getAllOfflineContent();
    expect(content).toHaveLength(1);
    expect(content[0].id).toBe('test-id');
  });

  it('returns a specific offline content by ID', () => {
    const content = offlineStorage.getOfflineContent('test-id');
    expect(content).not.toBeNull();
    expect(content?.id).toBe('test-id');
  });

  it('returns null for non-existent content', () => {
    // Mock the service to return undefined for a specific ID
    vi.mocked(OfflineStorageService).mockImplementation(
      () =>
        ({
          getOfflineContent: vi.fn().mockReturnValue(undefined),
        }) as any
    );

    const content = offlineStorage.getOfflineContent('non-existent-id');
    expect(content).toBeNull();
  });

  it('adds new offline content', () => {
    const newContent = {
      type: 'post' as const,
      content: 'New content',
      publishAt: new Date('2023-12-31T12:00:00Z'),
      status: ScheduledContentStatusEnum.SCHEDULED,
      authorId: 'author-id',
      version: 1,
      hasActiveUpdate: false,
      lastModified: new Date(),
      syncStatus: 'pending' as const,
      retryCount: 0,
      maxRetries: 3,
    };

    const result = offlineStorage.addOfflineContent(newContent);
    expect(result.id).toBe('new-id');
    expect(result.content).toBe('New content');
  });

  it('updates existing offline content', () => {
    const updatedContent = {
      content: 'Updated content',
      syncStatus: 'synced' as const,
    };

    const result = offlineStorage.updateOfflineContent('test-id', updatedContent);
    expect(result.id).toBe('test-id');
    expect(result.content).toBe('Updated content');
    expect(result.syncStatus).toBe('synced');
  });

  it('deletes offline content', () => {
    offlineStorage.deleteOfflineContent('test-id');
    expect(
      vi.mocked(OfflineStorageService).mock.results[0].value.deleteOfflineContent
    ).toHaveBeenCalledWith('test-id');
  });

  it('retries syncing a failed content item', () => {
    offlineStorage.retrySync('test-id');
    expect(vi.mocked(OfflineStorageService).mock.results[0].value.retrySync).toHaveBeenCalledWith(
      'test-id'
    );
  });

  it('resolves a sync conflict', () => {
    offlineStorage.resolveConflict('test-id', 'local');
    expect(
      vi.mocked(OfflineStorageService).mock.results[0].value.resolveConflict
    ).toHaveBeenCalledWith('test-id', 'local');
  });
});
