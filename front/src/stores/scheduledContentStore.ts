import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import { TimerService, type ITimer } from '@/services/TimerService';
import { useBackgroundTimer } from '@/services/BackgroundTimerService';
import type { IBlogPost } from '@/types/blog';
import { useAuthStore } from './authStore';
import { API_BASE_URL } from '@/config';
import { apiGet, apiPost, apiPut, apiDelete } from '@/api/apiClient';
import type { ScheduledContentStatusEnum } from '@/types/scheduling';
import type { IScheduledContent } from '@/types/content';

export interface IScheduledContentWithTimer extends IScheduledContent {
  timer?: ITimer;
}

export const useScheduledContentStore = defineStore('scheduledContent', () => {
  const scheduledContent = ref<IScheduledContent[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const scheduledPosts = computed(() => 
    scheduledContent.value.filter(content => 
      // Filter based on metadata or other properties
      content.metadata?.contentType === 'post'
    )
  );

  const scheduledComments = computed(() => 
    scheduledContent.value.filter(content => 
      // Filter based on metadata or other properties
      content.metadata?.contentType === 'comment'
    )
  );

  function getContentById(id: string): IScheduledContent | undefined {
    return scheduledContent.value.find(content => content.id === id);
  }

  function setScheduledContent(content: IScheduledContent[]): void {
    scheduledContent.value = content;
  }

  function addScheduledContent(content: IScheduledContent): void {
    scheduledContent.value.push(content);
  }

  function updateScheduledContent(updatedContent: IScheduledContent): void {
    const index = scheduledContent.value.findIndex(
      (content: IScheduledContent) => content.id === updatedContent.id
    );
    if (index !== -1) {
      scheduledContent.value[index] = updatedContent;
    }
  }

  function removeScheduledContent(id: string): void {
    scheduledContent.value = scheduledContent.value.filter(
      (content: IScheduledContent) => content.id !== id
    );
  }

  function setLoading(isLoading: boolean): void {
    loading.value = isLoading;
  }

  function setError(err: string | null): void {
    error.value = err;
  }

  /**
   * Fetch scheduled content from the API
   * @param contentId Optional ID to fetch a specific content
   */
  async function fetchScheduledContent(contentId?: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const endpoint = contentId 
        ? `/v1/scheduled-content/${contentId}` 
        : '/v1/scheduled-content';
      
      const response = await apiGet(endpoint);
      
      if (response.success) {
        if (contentId) {
          // Single content fetched
          if (response.data) {
            // Type assertion for response data
            const contentData = response.data as IScheduledContent;
            
            const index = scheduledContent.value.findIndex(
              (content) => content.id === contentData.id
            );
            
            if (index !== -1) {
              // Update existing content
              scheduledContent.value[index] = contentData;
            } else {
              // Add new content
              scheduledContent.value.push(contentData);
            }
          }
        } else {
          // Multiple content items fetched
          if (Array.isArray(response.data)) {
            // Type assertion for array of content
            scheduledContent.value = response.data as IScheduledContent[];
          }
        }
      } else {
        throw new Error(response.message || 'Failed to fetch scheduled content');
      }
    } catch (err) {
      console.error('Error fetching scheduled content:', err);
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching content';
    } finally {
      loading.value = false;
    }
  }

  return {
    scheduledContent,
    loading,
    error,
    scheduledPosts,
    scheduledComments,
    getContentById,
    setScheduledContent,
    addScheduledContent,
    updateScheduledContent,
    removeScheduledContent,
    setLoading,
    setError,
    fetchScheduledContent,
  };
});
