/**
 * FeatureFlagService
 *
 * A service that manages feature flags for the application.
 * Handles enabling/disabling features based on user roles, environment, or other conditions.
 */

import { ref, computed } from 'vue';
import type { Ref } from 'vue';

export interface IFeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  conditions?: {
    roles?: string[];
    environments?: string[];
    percentage?: number;
    startDate?: Date;
    endDate?: Date;
  };
}

class FeatureFlagService {
  private static instance: FeatureFlagService;
  private featureFlags: Ref<Map<string, IFeatureFlag>> = ref(new Map());
  private isLoading: Ref<boolean> = ref(false);
  private error: Ref<string | null> = ref(null);
  private userRole: Ref<string | null> = ref(null);
  private environment: Ref<string> = ref('development');

  private constructor() {
    // Private constructor to enforce singleton pattern
    this.initializeFeatureFlags();
  }

  /**
   * Get the singleton instance of FeatureFlagService
   */
  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Initialize feature flags with default values
   */
  private initializeFeatureFlags(): void {
    const defaultFlags: IFeatureFlag[] = [
      {
        name: 'scheduledContent',
        enabled: true,
        description: 'Enable the 24-hour delay for content publication',
        conditions: {
          roles: ['admin', 'author', 'editor'],
          environments: ['development', 'staging', 'production'],
        },
      },
      {
        name: 'contentVersioning',
        enabled: true,
        description: 'Enable version history for content updates',
        conditions: {
          roles: ['admin', 'author', 'editor'],
          environments: ['development', 'staging', 'production'],
        },
      },
      {
        name: 'adminDelayOverride',
        enabled: true,
        description: 'Allow admins to override content delay settings',
        conditions: {
          roles: ['admin'],
          environments: ['development', 'staging', 'production'],
        },
      },
      {
        name: 'offlineSupport',
        enabled: true,
        description: 'Enable offline support for scheduled content',
        conditions: {
          roles: ['admin', 'author', 'editor'],
          environments: ['development', 'staging', 'production'],
        },
      },
    ];

    const flagsMap = new Map<string, IFeatureFlag>();
    for (const flag of defaultFlags) {
      flagsMap.set(flag.name, flag);
    }

    this.featureFlags.value = flagsMap;
  }

  /**
   * Fetch feature flags from the server
   */
  public async fetchFeatureFlags(): Promise<void> {
    this.isLoading.value = true;
    this.error.value = null;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/feature-flags');
      // const data = await response.json();

      // For now, we'll just use the default flags
      this.initializeFeatureFlags();
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to fetch feature flags';
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * Set the user role for feature flag evaluation
   * @param role - User role
   */
  public setUserRole(role: string | null): void {
    this.userRole.value = role;
  }

  /**
   * Set the environment for feature flag evaluation
   * @param env - Environment name
   */
  public setEnvironment(env: string): void {
    this.environment.value = env;
  }

  /**
   * Check if a feature is enabled
   * @param featureName - Name of the feature
   * @returns True if the feature is enabled
   */
  public isFeatureEnabled(featureName: string): boolean {
    const flag = this.featureFlags.value.get(featureName);
    if (!flag) return false;

    // If the flag is globally disabled, return false
    if (!flag.enabled) return false;

    // If there are no conditions, the feature is enabled
    if (!flag.conditions) return true;

    // Check role condition
    if (flag.conditions.roles && flag.conditions.roles.length > 0) {
      if (!this.userRole.value || !flag.conditions.roles.includes(this.userRole.value)) {
        return false;
      }
    }

    // Check environment condition
    if (flag.conditions.environments && flag.conditions.environments.length > 0) {
      if (!flag.conditions.environments.includes(this.environment.value)) {
        return false;
      }
    }

    // Check date range condition
    if (flag.conditions.startDate && new Date() < flag.conditions.startDate) {
      return false;
    }

    if (flag.conditions.endDate && new Date() > flag.conditions.endDate) {
      return false;
    }

    // Check percentage rollout condition
    if (flag.conditions.percentage !== undefined) {
      // Simple implementation - in a real app, this would use a consistent hashing algorithm
      const randomValue = Math.random() * 100;
      if (randomValue > flag.conditions.percentage) {
        return false;
      }
    }

    // All conditions passed
    return true;
  }

  /**
   * Get all feature flags
   */
  public get currentFeatureFlags(): Ref<Map<string, IFeatureFlag>> {
    return this.featureFlags;
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

  /**
   * Get the current user role
   */
  public get currentUserRole(): Ref<string | null> {
    return this.userRole;
  }

  /**
   * Get the current environment
   */
  public get currentEnvironment(): Ref<string> {
    return this.environment;
  }
}

export const featureFlagService = FeatureFlagService.getInstance();
