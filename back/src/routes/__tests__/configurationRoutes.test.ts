import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import type { Request, Response } from 'express';
import app from '../../app';
import { ConfigurationController } from '../../controllers/ConfigurationController';

jest.mock('../../controllers/ConfigurationController');

describe('Configuration Routes', () => {
  const mockAdminUser = {
    id: 'test-admin-id',
    isAdmin: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/configuration/global-delay', () => {
    it('should return global delay settings', async () => {
      const mockSettings = {
        delayHours: 24,
        updatedBy: 'test-admin-id',
        updatedAt: new Date(),
      };

      jest
        .mocked(ConfigurationController.getInstance().getGlobalDelay)
        .mockImplementationOnce(async (req: Request, res: Response) => {
          res.json(mockSettings);
        });

      const response = await request(app)
        .get('/api/configuration/global-delay')
        .set('Authorization', `Bearer ${mockAdminUser.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSettings);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/configuration/global-delay');

      expect(response.status).toBe(401);
    });

    it('should return 403 when not admin', async () => {
      const mockNonAdminUser = {
        id: 'test-user-id',
        isAdmin: false,
      };

      const response = await request(app)
        .get('/api/configuration/global-delay')
        .set('Authorization', `Bearer ${mockNonAdminUser.id}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/configuration/global-delay', () => {
    it('should update global delay settings', async () => {
      const mockSettings = {
        delayHours: 48,
        updatedBy: 'test-admin-id',
        updatedAt: new Date(),
      };

      jest
        .mocked(ConfigurationController.getInstance().updateGlobalDelay)
        .mockImplementationOnce(async (req: Request, res: Response) => {
          res.json(mockSettings);
        });

      const response = await request(app)
        .put('/api/configuration/global-delay')
        .set('Authorization', `Bearer ${mockAdminUser.id}`)
        .send({ delayHours: 48 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSettings);
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .put('/api/configuration/global-delay')
        .set('Authorization', `Bearer ${mockAdminUser.id}`)
        .send({ delayHours: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Delay hours must be a number' });
    });
  });

  describe('GET /api/configuration/content-override/:contentId', () => {
    it('should return content override', async () => {
      const mockOverride = {
        contentId: 'test-content-id',
        delayHours: 12,
        reason: 'Testing',
        createdBy: 'test-admin-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .mocked(ConfigurationController.getInstance().getContentOverride)
        .mockImplementationOnce(async (req: Request, res: Response) => {
          res.json(mockOverride);
        });

      const response = await request(app)
        .get('/api/configuration/content-override/test-content-id')
        .set('Authorization', `Bearer ${mockAdminUser.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOverride);
    });

    it('should return 404 when override not found', async () => {
      jest
        .mocked(ConfigurationController.getInstance().getContentOverride)
        .mockImplementationOnce(async (req: Request, res: Response) => {
          res.status(404).json({ error: 'Content override not found' });
        });

      const response = await request(app)
        .get('/api/configuration/content-override/non-existent-id')
        .set('Authorization', `Bearer ${mockAdminUser.id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Content override not found' });
    });
  });

  describe('POST /api/configuration/content-override/:contentId', () => {
    it('should create content override', async () => {
      const mockOverride = {
        contentId: 'test-content-id',
        delayHours: 12,
        reason: 'Testing',
        createdBy: 'test-admin-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .mocked(ConfigurationController.getInstance().createContentOverride)
        .mockImplementationOnce(async (req: Request, res: Response) => {
          res.json(mockOverride);
        });

      const response = await request(app)
        .post('/api/configuration/content-override/test-content-id')
        .set('Authorization', `Bearer ${mockAdminUser.id}`)
        .send({ delayHours: 12, reason: 'Testing' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOverride);
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/configuration/content-override/test-content-id')
        .set('Authorization', `Bearer ${mockAdminUser.id}`)
        .send({ delayHours: 'invalid', reason: 'Testing' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Delay hours must be a number' });
    });
  });

  describe('DELETE /api/configuration/content-override/:contentId', () => {
    it('should remove content override', async () => {
      jest
        .mocked(ConfigurationController.getInstance().removeContentOverride)
        .mockImplementationOnce(async (req: Request, res: Response) => {
          res.status(204).send();
        });

      const response = await request(app)
        .delete('/api/configuration/content-override/test-content-id')
        .set('Authorization', `Bearer ${mockAdminUser.id}`);

      expect(response.status).toBe(204);
    });
  });
});
