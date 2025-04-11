import { ConfigurationModel } from '../models/ConfigurationModel';
import type {
  IGlobalDelaySettings,
  IContentOverride,
  IConfigurationError,
} from '../types/configuration';
import { EventEmitter } from 'node:events';
import ErrorHandler, { ErrorCategory, ErrorSeverity } from './ErrorHandler';
import MonitoringService from './MonitoringService';
import { HealthStatus } from './MonitoringService';

export interface IDelaySettings {
  globalDelayHours: number;
  lastModifiedBy: string;
  lastModifiedAt: Date;
}

interface IConfiguration {
  key: string;
  value: unknown;
  description?: string;
  updatedAt: Date;
  updatedBy?: string;
  requiresVerification?: boolean;
  lastVerifiedBy?: string;
  lastVerifiedAt?: Date;
  verificationMethod?: '2fa' | 'admin_approval' | 'none';
}

interface IConfigurationHistory {
  timestamp: Date;
  userId: string;
  action: string;
  details: Record<string, unknown>;
}

class ConfigurationService extends EventEmitter {
  private static instance: ConfigurationService;
  private defaultDelayHours = 24;
  private contentOverrides: Map<string, IContentOverride> = new Map();
  private defaultDelay: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private errorHandler: typeof ErrorHandler;
  private monitoringService: typeof MonitoringService;

  private constructor() {
    super();
    this.errorHandler = ErrorHandler;
    this.monitoringService = MonitoringService;
    this.initializeDefaultConfigurations();
  }

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  /**
   * Initialize default configurations if they don't exist
   * @returns Promise<void>
   */
  private async initializeDefaultConfigurations(): Promise<void> {
    try {
      const defaultConfigs = [
        {
          key: 'slow_feature_delay',
          value: this.defaultDelay,
          description: 'Global delay for The Slow feature in milliseconds',
          requiresVerification: true,
          verificationMethod: '2fa',
        },
      ];

      for (const config of defaultConfigs) {
        const existingConfig = await ConfigurationModel.findOne({ key: config.key });
        if (!existingConfig) {
          await ConfigurationModel.create({
            ...config,
            updatedAt: new Date(),
          });
        }
      }
    } catch (error) {
      this.handleError('Failed to initialize default configurations', error);
    }
  }

  /**
   * Get global delay settings
   * @returns Promise<IGlobalDelaySettings>
   */
  public async getGlobalDelay(): Promise<IGlobalDelaySettings> {
    const config = await ConfigurationModel.findOne({ key: 'globalDelay' });
    if (!config) {
      const error = new Error('Global delay settings not found') as IConfigurationError;
      error.code = 'CONFIG_NOT_FOUND';
      throw error;
    }
    return config.value as IGlobalDelaySettings;
  }

  /**
   * Update global delay settings
   * @param delayHours New delay in hours
   * @param userId ID of the user making the change
   * @returns Promise<IGlobalDelaySettings>
   */
  public async updateGlobalDelay(
    delayHours: number,
    userId: string
  ): Promise<IGlobalDelaySettings> {
    if (delayHours < 0) {
      const error = new Error('Delay hours must be positive') as IConfigurationError;
      error.code = 'INVALID_DELAY';
      throw error;
    }

    const settings: IGlobalDelaySettings = {
      delayHours,
      updatedAt: new Date(),
      updatedBy: userId,
    };

    await ConfigurationModel.findOneAndUpdate(
      { key: 'globalDelay' },
      { value: settings },
      { upsert: true }
    );

    this.emit('globalDelayUpdated', settings);
    return settings;
  }

  /**
   * Create a delay override for specific content
   * @param contentId ID of the content
   * @param delayHours Custom delay in hours
   * @param reason Reason for the override
   * @param userId ID of the user creating the override
   * @param type Type of content ('post' or 'comment')
   * @returns Promise<IContentOverride>
   */
  public async createContentOverride(
    contentId: string,
    delayHours: number,
    reason: string,
    userId: string,
    type?: 'post' | 'comment'
  ): Promise<IContentOverride> {
    if (delayHours < 0) {
      const error = new Error('Delay hours must be positive') as IConfigurationError;
      error.code = 'INVALID_DELAY';
      throw error;
    }

    const override: IContentOverride = {
      contentId,
      type,
      delayHours,
      reason,
      createdAt: new Date(),
      createdBy: userId,
      updatedAt: new Date(),
    };

    await ConfigurationModel.findOneAndUpdate(
      { key: 'contentOverride', 'value.contentId': contentId },
      { value: override },
      { upsert: true }
    );

    this.emit('contentOverrideCreated', override);
    return override;
  }

  /**
   * Get delay override for specific content
   * @param contentId ID of the content
   * @returns Promise<IContentOverride | null>
   */
  public async getContentOverride(contentId: string): Promise<IContentOverride | null> {
    const config = await ConfigurationModel.findOne({
      key: 'contentOverride',
      'value.contentId': contentId,
    });
    return config ? (config.value as IContentOverride) : null;
  }

  /**
   * Remove delay override for specific content
   * @param contentId ID of the content
   * @returns Promise<void>
   */
  public async removeContentOverride(contentId: string): Promise<void> {
    await ConfigurationModel.deleteOne({
      key: 'contentOverride',
      'value.contentId': contentId,
    });
    this.emit('contentOverrideRemoved', { contentId });
  }

  /**
   * Get effective delay for content
   * @param contentId ID of the content
   * @param type Type of content ('post' or 'comment')
   * @returns Promise<number> Delay in hours
   */
  public async getEffectiveDelay(contentId: string, type: 'post' | 'comment'): Promise<number> {
    const override = await this.getContentOverride(contentId);
    if (override) {
      return override.delayHours;
    }

    const globalSettings = await this.getGlobalDelay();
    return globalSettings.delayHours;
  }

  private async initializeGlobalDelay(): Promise<IGlobalDelaySettings> {
    const settings: IGlobalDelaySettings = {
      delayHours: this.defaultDelayHours,
      updatedAt: new Date(),
      updatedBy: 'system',
    };

    await ConfigurationModel.create({
      key: 'globalDelay',
      value: settings,
    });

    this.emit('globalDelayUpdated', settings);
    return settings;
  }

  /**
   * Get the global delay setting
   * @returns Promise<number> The global delay in milliseconds
   */
  public async getGlobalDelayMilliseconds(): Promise<number> {
    try {
      const config = await ConfigurationModel.findOne({ key: 'slow_feature_delay' });
      if (!config) {
        return this.defaultDelay;
      }
      return config.value as number;
    } catch (error) {
      this.handleError('Failed to get global delay milliseconds', error);
      return this.defaultDelay;
    }
  }

  /**
   * Set the global delay setting
   * @param delay The new delay in milliseconds
   * @param userId The ID of the user making the change
   * @param requiresVerification Whether the change requires verification
   * @returns Promise<void>
   */
  public async setGlobalDelayMilliseconds(
    delay: number,
    userId: string,
    requiresVerification = true
  ): Promise<void> {
    try {
      const config = await ConfigurationModel.findOne({ key: 'slow_feature_delay' });
      if (!config) {
        await ConfigurationModel.create({
          key: 'slow_feature_delay',
          value: delay,
          description: 'Global delay for The Slow feature in milliseconds',
          updatedAt: new Date(),
          updatedBy: userId,
          requiresVerification,
          verificationMethod: requiresVerification ? '2fa' : 'none',
        });
      } else {
        config.value = delay;
        config.updatedAt = new Date();
        config.updatedBy = userId;
        config.requiresVerification = requiresVerification;
        config.verificationMethod = requiresVerification ? '2fa' : 'none';
        await config.save();
      }

      // Emit event for configuration change
      this.emit('configurationChanged', {
        key: 'slow_feature_delay',
        value: delay,
        updatedBy: userId,
        timestamp: new Date(),
      });

      // Update monitoring metrics
      MonitoringService.updateHealthCheck('configuration', {
        name: 'configuration',
        status: HealthStatus.HEALTHY,
        message: `Global delay updated to ${delay}ms`,
        timestamp: new Date(),
      });
    } catch (error) {
      this.handleError('Failed to set global delay milliseconds', error);
      throw error;
    }
  }

  /**
   * Override the delay for a specific content
   * @param contentId The ID of the content
   * @param type The type of content ('post' | 'comment')
   * @param delayHours The override delay in hours
   * @param userId The ID of the user making the change
   * @param reason The reason for the override
   * @returns Promise<void>
   */
  public async overrideContentDelay(
    contentId: string,
    type: 'post' | 'comment',
    delayHours: number,
    userId: string,
    reason: string
  ): Promise<void> {
    try {
      const override: IContentOverride = {
        contentId,
        type,
        delayHours,
        reason,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ConfigurationModel.findOneAndUpdate(
        { key: 'contentOverride', 'value.contentId': contentId },
        { value: override },
        { upsert: true }
      );

      this.contentOverrides.set(contentId, override);
      this.emit('contentOverrideCreated', override);
    } catch (error) {
      this.handleError('Failed to override content delay', error);
      throw error;
    }
  }

  /**
   * Get all content overrides
   * @returns Promise<IContentOverride[]> Array of content overrides
   */
  public async getContentOverrides(): Promise<IContentOverride[]> {
    try {
      const configs = await ConfigurationModel.find({ key: 'contentOverride' });
      const activeOverrides = configs.map((config) => config.value as IContentOverride);
      return activeOverrides;
    } catch (error) {
      this.handleError('Failed to get content overrides', error);
      return [];
    }
  }

  /**
   * Reset a content override
   * @param contentId The ID of the content
   * @returns Promise<void>
   */
  public async resetContentOverride(contentId: string): Promise<void> {
    try {
      await ConfigurationModel.deleteOne({
        key: 'contentOverride',
        'value.contentId': contentId,
      });

      this.contentOverrides.delete(contentId);
      this.emit('contentOverrideRemoved', { contentId });
    } catch (error) {
      this.handleError('Failed to reset content override', error);
      throw error;
    }
  }

  /**
   * Get the configuration history
   * @param key The configuration key
   * @returns Promise<IConfiguration[]> Array of configuration history
   */
  public async getConfigurationHistory(key: string): Promise<IConfiguration[]> {
    try {
      const configs = await ConfigurationModel.find({ key }).sort({ updatedAt: -1 });
      return configs.map((config) => ({
        key: config.key,
        value: config.value,
        description: config.description,
        updatedAt: config.updatedAt,
        updatedBy: config.updatedBy,
        requiresVerification: config.requiresVerification,
        lastVerifiedBy: config.lastVerifiedBy,
        lastVerifiedAt: config.lastVerifiedAt,
        verificationMethod: config.verificationMethod,
      }));
    } catch (error) {
      this.handleError('Failed to get configuration history', error);
      return [];
    }
  }

  private handleError(message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.errorHandler.handleError(new Error(errorMessage), {
      message,
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.VALIDATION,
      timestamp: new Date(),
      context: { error: errorMessage },
    });

    this.monitoringService.updateHealthCheck('configuration', {
      name: 'configuration',
      status: HealthStatus.UNHEALTHY,
      message: errorMessage,
      timestamp: new Date(),
      details: { error: errorMessage },
    });
  }

  private handleConfigurationError(message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.errorHandler.handleError(new Error(errorMessage), {
      message,
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.VALIDATION,
      timestamp: new Date(),
      context: { error: errorMessage },
    });

    this.monitoringService.updateHealthCheck('configuration', {
      name: 'configuration',
      status: HealthStatus.UNHEALTHY,
      message: errorMessage,
      timestamp: new Date(),
      details: { error: errorMessage },
    });
  }

  private handleSystemError(message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.errorHandler.handleError(new Error(errorMessage), {
      message,
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.UNKNOWN,
      timestamp: new Date(),
      context: { error: errorMessage },
    });

    this.monitoringService.updateHealthCheck('configuration', {
      name: 'configuration',
      status: HealthStatus.UNHEALTHY,
      message: errorMessage,
      timestamp: new Date(),
      details: { error: errorMessage },
    });
  }
}

export default ConfigurationService.getInstance();
