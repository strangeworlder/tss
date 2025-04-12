import type { IConfiguration, IContentOverride } from '@/types/configuration';

export const api = {
  async getGlobalDelay(): Promise<{ postDelay: number; commentDelay: number }> {
    const response = await fetch('/api/configuration/global-delay');
    if (!response.ok) {
      throw new Error('Failed to fetch global delay');
    }
    return response.json();
  },

  async setGlobalDelay(postDelay: number, commentDelay: number): Promise<void> {
    const response = await fetch('/api/configuration/global-delay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postDelay, commentDelay }),
    });
    if (!response.ok) {
      throw new Error('Failed to set global delay');
    }
  },

  async getContentOverrides(): Promise<IContentOverride[]> {
    const response = await fetch('/api/configuration/content-overrides');
    if (!response.ok) {
      throw new Error('Failed to fetch content overrides');
    }
    return response.json();
  },

  async overrideContentDelay(
    override: Omit<IContentOverride, 'createdAt' | 'createdBy'>
  ): Promise<IContentOverride> {
    const response = await fetch('/api/configuration/content-overrides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(override),
    });
    if (!response.ok) {
      throw new Error('Failed to override content delay');
    }
    return response.json();
  },

  async resetContentOverrides(): Promise<void> {
    const response = await fetch('/api/configuration/content-overrides', {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to reset content overrides');
    }
  },

  async getConfigurationHistory(): Promise<IConfiguration[]> {
    const response = await fetch('/api/configuration/history');
    if (!response.ok) {
      throw new Error('Failed to fetch configuration history');
    }
    return response.json();
  },
};
