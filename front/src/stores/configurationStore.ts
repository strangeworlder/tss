import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IContentOverride, IConfiguration } from '@/types/configuration';
import { apiGet, apiPost } from '@/api/apiClient';
import type { IApiResponse } from '@/types/blog';

export const useConfigurationStore = defineStore('configuration', () => {
  const globalDelay = ref<number>(0);
  const contentOverrides = ref<IContentOverride[]>([]);
  const configurationHistory = ref<IConfiguration[]>([]);

  async function getGlobalDelay(): Promise<number> {
    try {
      const response = await apiGet<{ globalDelay: number }>('/configuration/global-delay');
      globalDelay.value = response.success ? response.data.globalDelay : 0;
      return globalDelay.value;
    } catch (error) {
      console.error('Failed to fetch global delay:', error);
      return globalDelay.value;
    }
  }

  async function setGlobalDelay(delay: number): Promise<void> {
    try {
      await apiPost('/configuration/global-delay', { delay });
      globalDelay.value = delay;
    } catch (error) {
      console.error('Failed to set global delay:', error);
      throw error;
    }
  }

  async function getContentOverrides(): Promise<IContentOverride[]> {
    try {
      const response = await apiGet<IContentOverride[]>('/configuration/content-overrides');
      contentOverrides.value = response.success ? response.data : [];
      return contentOverrides.value;
    } catch (error) {
      console.error('Failed to fetch content overrides:', error);
      return contentOverrides.value;
    }
  }

  async function overrideContentDelay(
    contentId: string,
    contentType: 'post' | 'comment',
    delayOverride: number,
    reason?: string
  ): Promise<IContentOverride> {
    try {
      const override = {
        id: `temp-${Date.now()}`, // Add temporary ID that will be replaced by server
        contentId,
        contentType,
        delayOverride,
      };

      const response = await apiPost<IContentOverride>(
        '/configuration/content-overrides',
        override
      );

      if (response.success) {
        contentOverrides.value = [...contentOverrides.value, response.data];
        return response.data;
      }
      throw new Error('Failed to override content delay');
    } catch (error) {
      console.error('Failed to override content delay:', error);
      throw error;
    }
  }

  async function resetContentOverrides(): Promise<void> {
    try {
      await apiPost('/configuration/content-overrides/reset', {});
      contentOverrides.value = [];
    } catch (error) {
      console.error('Failed to reset content overrides:', error);
      throw error;
    }
  }

  async function getConfigurationHistory(): Promise<IConfiguration[]> {
    try {
      const response = await apiGet<IConfiguration[]>('/configuration/history');
      configurationHistory.value = response.success ? response.data : [];
      return configurationHistory.value;
    } catch (error) {
      console.error('Failed to fetch configuration history:', error);
      return configurationHistory.value;
    }
  }

  return {
    globalDelay,
    contentOverrides,
    configurationHistory,
    getGlobalDelay,
    setGlobalDelay,
    getContentOverrides,
    overrideContentDelay,
    resetContentOverrides,
    getConfigurationHistory,
  };
});
