import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IScheduledContent } from '@/types/scheduling';
import { ScheduledContentStatusEnum } from '@/types/scheduling';
import { apiGet, apiPost } from '@/api/apiClient';
import type { IApiResponse } from '@/types/blog';

export const useScheduledContentStore = defineStore('scheduledContent', () => {
  const scheduledContent = ref<Record<string, IScheduledContent>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getScheduledContentById = computed(() => {
    return (contentId: string): IScheduledContent | undefined => {
      return Object.values(scheduledContent.value).find(
        (content: IScheduledContent) => content.id === contentId
      );
    };
  });

  const getScheduledContentByContentId = computed(() => {
    return (contentId: string): IScheduledContent | undefined => {
      return Object.values(scheduledContent.value).find(
        (content: IScheduledContent) => content.id === contentId
      );
    };
  });

  const hasActiveTimer = computed(() => {
    return (contentId: string): boolean => {
      const content = getScheduledContentByContentId.value(contentId);
      return content?.status === ScheduledContentStatusEnum.SCHEDULED;
    };
  });

  function transformResponse(data: any): IScheduledContent {
    return {
      id: data.id,
      type: data.type,
      content: {
        title: data.content?.title || '',
        content: data.content?.content || data.content || '',
      },
      publishAt: new Date(data.publishAt),
      status: data.status as ScheduledContentStatusEnum,
      authorId: data.authorId,
      version: data.version,
      hasActiveUpdate: data.hasActiveUpdate || false,
      lastModified: new Date(data.lastModified || data.updatedAt || data.createdAt),
    };
  }

  async function fetchScheduledContent(contentId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiGet<any>(`/v1/scheduled-content/${contentId}`);
      if (response.success && response.data) {
        const transformed = transformResponse(response.data);
        scheduledContent.value[transformed.id] = transformed;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    } finally {
      loading.value = false;
    }
  }

  async function createScheduledContent(content: Partial<IScheduledContent>): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiPost<any>('/v1/scheduled-content', content);
      if (response.success && response.data) {
        const transformed = transformResponse(response.data);
        scheduledContent.value[transformed.id] = transformed;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    } finally {
      loading.value = false;
    }
  }

  async function updateScheduledContent(
    contentId: string,
    content: Partial<IScheduledContent>
  ): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiPost<any>(`/v1/scheduled-content/${contentId}`, content);
      if (response.success && response.data) {
        const transformed = transformResponse(response.data);
        scheduledContent.value[transformed.id] = transformed;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    } finally {
      loading.value = false;
    }
  }

  async function cancelScheduledContent(contentId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiPost<any>(`/v1/scheduled-content/${contentId}/cancel`, {});
      if (response.success && response.data) {
        const transformed = transformResponse(response.data);
        scheduledContent.value[transformed.id] = transformed;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    } finally {
      loading.value = false;
    }
  }

  async function retryPublication(contentId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiPost<any>(`/v1/scheduled-content/${contentId}/retry`, {});
      if (response.success && response.data) {
        const transformed = transformResponse(response.data);
        scheduledContent.value[transformed.id] = transformed;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    } finally {
      loading.value = false;
    }
  }

  return {
    scheduledContent,
    loading,
    error,
    getScheduledContentById,
    getScheduledContentByContentId,
    hasActiveTimer,
    fetchScheduledContent,
    createScheduledContent,
    updateScheduledContent,
    cancelScheduledContent,
    retryPublication,
  };
});
