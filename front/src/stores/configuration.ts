import { defineStore } from 'pinia';
import type { IConfiguration, IContentOverride, IConfigurationState } from '@/types/configuration';
import { api } from '@/services/api';

export const useConfigurationStore = defineStore('configuration', {
  state: (): IConfigurationState => ({
    postDelay: 24,
    commentDelay: 12,
    contentOverrides: [],
    configurationHistory: [],
    loading: false,
    error: null,
  }),

  getters: {
    getPostDelay: (state: IConfigurationState) => state.postDelay,
    getCommentDelay: (state: IConfigurationState) => state.commentDelay,
    getContentOverrides: (state: IConfigurationState) => state.contentOverrides,
    getConfigurationHistory: (state: IConfigurationState) => state.configurationHistory,
    isLoading: (state: IConfigurationState) => state.loading,
    getError: (state: IConfigurationState) => state.error,
  },

  actions: {
    async fetchGlobalDelay(this: IConfigurationState) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getGlobalDelay();
        this.postDelay = response.postDelay;
        this.commentDelay = response.commentDelay;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch global delay';
      } finally {
        this.loading = false;
      }
    },

    async setGlobalDelay(this: IConfigurationState, postDelay: number, commentDelay: number) {
      this.loading = true;
      this.error = null;
      try {
        await api.setGlobalDelay(postDelay, commentDelay);
        this.postDelay = postDelay;
        this.commentDelay = commentDelay;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to set global delay';
      } finally {
        this.loading = false;
      }
    },

    async fetchContentOverrides(this: IConfigurationState) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getContentOverrides();
        this.contentOverrides = response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch content overrides';
      } finally {
        this.loading = false;
      }
    },

    async overrideContentDelay(
      this: IConfigurationState,
      override: Omit<IContentOverride, 'createdAt' | 'createdBy'>
    ) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.overrideContentDelay(override);
        this.contentOverrides.push(response);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to override content delay';
      } finally {
        this.loading = false;
      }
    },

    async resetContentOverrides(this: IConfigurationState) {
      this.loading = true;
      this.error = null;
      try {
        await api.resetContentOverrides();
        this.contentOverrides = [];
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to reset content overrides';
      } finally {
        this.loading = false;
      }
    },

    async fetchConfigurationHistory(this: IConfigurationState) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getConfigurationHistory();
        this.configurationHistory = response;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to fetch configuration history';
      } finally {
        this.loading = false;
      }
    },
  },
});
