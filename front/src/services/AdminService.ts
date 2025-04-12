/**
 * AdminService
 *
 * A service that manages admin settings for the scheduling delay feature.
 * Handles fetching and updating global delay settings and individual content overrides.
 */

import { ref, computed } from 'vue';
import type { Ref } from 'vue';

export interface IDelaySettings {
  postDelay: number; // in hours
  commentDelay: number; // in hours
  minDelay: number; // in hours
  maxDelay: number; // in hours
  lastUpdated: Date;
  updatedBy: string;
}

export interface IContentDelayOverride {
  contentId: string;
  delay: number; // in hours
  reason: string;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
}

class AdminService {
  private static instance: AdminService;
  private delaySettings: Ref<IDelaySettings | null> = ref(null);
  private contentOverrides: Ref<Map<string, IContentDelayOverride>> = ref(new Map());
  private isLoading: Ref<boolean> = ref(false);
  private error: Ref<string | null> = ref(null);

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of AdminService
   */
  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  /**
   * Fetch the global delay settings from the server
   */
  public async fetchDelaySettings(): Promise<void> {
    this.isLoading.value = true;
    this.error.value = null;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/delay-settings');
      // const data = await response.json();

      // Mock data for now
      const mockData: IDelaySettings = {
        postDelay: 24,
        commentDelay: 12,
        minDelay: 1,
        maxDelay: 72,
        lastUpdated: new Date(),
        updatedBy: 'admin',
      };

      this.delaySettings.value = mockData;
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to fetch delay settings';
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * Update the global delay settings
   * @param settings - New delay settings
   */
  public async updateDelaySettings(settings: Partial<IDelaySettings>): Promise<void> {
    this.isLoading.value = true;
    this.error.value = null;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/delay-settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      // const data = await response.json();

      // Mock update for now
      if (this.delaySettings.value) {
        this.delaySettings.value = {
          ...this.delaySettings.value,
          ...settings,
          lastUpdated: new Date(),
        };
      }
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to update delay settings';
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * Fetch content delay overrides from the server
   */
  public async fetchContentOverrides(): Promise<void> {
    this.isLoading.value = true;
    this.error.value = null;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/content-overrides');
      // const data = await response.json();

      // Mock data for now
      const mockData: IContentDelayOverride[] = [
        {
          contentId: 'post-123',
          delay: 12,
          reason: 'Expedited review',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          createdAt: new Date(),
          createdBy: 'admin',
        },
      ];

      const overridesMap = new Map<string, IContentDelayOverride>();
      for (const override of mockData) {
        overridesMap.set(override.contentId, override);
      }

      this.contentOverrides.value = overridesMap;
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to fetch content overrides';
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * Add or update a content delay override
   * @param override - Content delay override
   */
  public async updateContentOverride(override: IContentDelayOverride): Promise<void> {
    this.isLoading.value = true;
    this.error.value = null;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/content-overrides/${override.contentId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(override)
      // });
      // const data = await response.json();

      // Mock update for now
      const overridesMap = new Map(this.contentOverrides.value);
      overridesMap.set(override.contentId, override);
      this.contentOverrides.value = overridesMap;
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to update content override';
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * Remove a content delay override
   * @param contentId - ID of the content
   */
  public async removeContentOverride(contentId: string): Promise<void> {
    this.isLoading.value = true;
    this.error.value = null;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/content-overrides/${contentId}`, {
      //   method: 'DELETE'
      // });

      // Mock removal for now
      const overridesMap = new Map(this.contentOverrides.value);
      overridesMap.delete(contentId);
      this.contentOverrides.value = overridesMap;
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to remove content override';
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * Get the effective delay for a specific content
   * @param contentId - ID of the content
   * @returns The effective delay in hours
   */
  public getEffectiveDelay(contentId: string): number {
    // Check if there's a content-specific override
    const override = this.contentOverrides.value.get(contentId);
    if (override) {
      // Check if the override has expired
      if (override.expiresAt && override.expiresAt < new Date()) {
        // Override has expired, use global delay
        return this.delaySettings.value?.postDelay || 24;
      }
      return override.delay;
    }

    // Use global delay if no override
    return this.delaySettings.value?.postDelay || 24;
  }

  /**
   * Check if a content has an active override
   * @param contentId - ID of the content
   * @returns True if the content has an active override
   */
  public hasActiveOverride(contentId: string): boolean {
    const override = this.contentOverrides.value.get(contentId);
    if (!override) return false;

    // Check if the override has expired
    if (override.expiresAt && override.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Get the current delay settings
   */
  public get currentDelaySettings(): Ref<IDelaySettings | null> {
    return this.delaySettings;
  }

  /**
   * Get the content overrides
   */
  public get currentContentOverrides(): Ref<Map<string, IContentDelayOverride>> {
    return this.contentOverrides;
  }

  /**
   * Get the loading state
   */
  public get loadingState(): Ref<boolean> {
    return this.isLoading;
  }

  /**
   * Get the error state
   */
  public get errorState(): Ref<string | null> {
    return this.error;
  }

  getDefaultDelay(): number {
    // Check if delay settings are loaded
    if (this.delaySettings.value) {
      // Return the postDelay or a default of 24 hours
      return this.delaySettings.value?.postDelay || 24;
    }

    // Default to 24 hours if settings not loaded
    return 24;
  }

  getPostDelay(): number {
    return this.delaySettings.value?.postDelay || 24;
  }
}

export const adminService = AdminService.getInstance();
