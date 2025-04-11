import { defineStore } from 'pinia';
import type { IConfiguration, IContentOverride, IConfigurationState } from '@/types/configuration';
import { api } from '@/services/api';

export const useConfigurationStore = defineStore('configuration', {
  state: (): IConfigurationState => ({
    globalDelay: 24,
    contentOverrides: [],
    configurationHistory: [],
    loading: false,
    error: null,
  }),

  getters: {
    getGlobalDelay: (state: IConfigurationState) => state.globalDelay,
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
        this.globalDelay = response.globalDelay;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch global delay';
      } finally {
        this.loading = false;
      }
    },

    async setGlobalDelay(this: IConfigurationState, delay: number) {
      this.loading = true;
      this.error = null;
      try {
        await api.setGlobalDelay(delay);
        this.globalDelay = delay;
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
