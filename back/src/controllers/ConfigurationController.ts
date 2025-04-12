import type { Request, Response } from 'express';
import ConfigurationService from '../services/ConfigurationService';
import type {
  IGlobalDelaySettings,
  IContentOverride,
  IConfigurationError,
} from '../types/configuration';

export class ConfigurationController {
  private static instance: ConfigurationController;

  private constructor() {}

  public static getInstance(): ConfigurationController {
    if (!ConfigurationController.instance) {
      ConfigurationController.instance = new ConfigurationController();
    }
    return ConfigurationController.instance;
  }

  public async getGlobalDelay(req: Request, res: Response): Promise<void> {
    try {
      const settings = await ConfigurationService.getGlobalDelay();
      res.json(settings);
    } catch (error) {
      const err = error as IConfigurationError;
      res.status(500).json({ error: err.message, code: err.code });
    }
  }

  public async updateGlobalDelay(req: Request, res: Response): Promise<void> {
    try {
      const { postDelayHours, commentDelayHours } = req.body;
      const userId = req.user?.id || 'system';

      if (typeof postDelayHours !== 'number' || typeof commentDelayHours !== 'number') {
        res.status(400).json({ error: 'Invalid delay values' });
        return;
      }

      const settings = await ConfigurationService.updateGlobalDelay(
        postDelayHours,
        commentDelayHours,
        userId
      );
      res.json(settings);
    } catch (error) {
      const err = error as IConfigurationError;
      res.status(500).json({ error: err.message, code: err.code });
    }
  }

  public async getContentOverride(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const override = await ConfigurationService.getContentOverride(contentId);

      if (!override) {
        res.status(404).json({ error: 'Content override not found' });
        return;
      }

      res.json(override);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async createContentOverride(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const { delayHours, reason } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (typeof delayHours !== 'number') {
        res.status(400).json({ error: 'Delay hours must be a number' });
        return;
      }

      if (!reason || typeof reason !== 'string') {
        res.status(400).json({ error: 'Reason is required and must be a string' });
        return;
      }

      const override = await ConfigurationService.createContentOverride(
        contentId,
        delayHours,
        reason,
        userId
      );
      res.json(override);
    } catch (error) {
      const configError = error as IConfigurationError;
      if (configError.code === 'INVALID_DELAY') {
        res.status(400).json({ error: configError.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  public async removeContentOverride(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      await ConfigurationService.removeContentOverride(contentId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
