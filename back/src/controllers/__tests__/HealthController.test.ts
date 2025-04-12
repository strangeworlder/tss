import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { Request, Response } from 'express';
import { HealthController } from '../HealthController';
import MonitoringService, {
  HealthStatus,
  type IHealthCheck,
  type IPerformanceMetrics,
} from '../../services/MonitoringService';
import ErrorHandler from '../../services/ErrorHandler';
import BatchProcessor from '../../services/BatchProcessor';
import SchedulingService from '../../services/SchedulingService';
import PublicationService from '../../services/PublicationService';

// Mock the services
jest.mock('../../services/MonitoringService', () => ({
  default: {
    getHealthChecks: jest.fn(),
    collectMetrics: jest.fn(),
    updateHealthCheck: jest.fn(),
    getPerformanceMetrics: jest.fn(),
  },
  HealthStatus,
}));

jest.mock('../../services/ErrorHandler', () => ({
  default: {
    getInstance: jest.fn().mockReturnValue({
      getErrorCount: jest.fn().mockReturnValue(0),
      getErrorRate: jest.fn().mockReturnValue(0),
    }),
  },
}));

jest.mock('../../services/BatchProcessor', () => ({
  default: {
    getInstance: jest.fn().mockReturnValue({}),
  },
}));

jest.mock('../../services/SchedulingService', () => ({
  default: {
    getInstance: jest.fn().mockReturnValue({
      getScheduledContent: jest.fn().mockResolvedValue([]),
    }),
  },
}));

jest.mock('../../services/PublicationService', () => ({
  default: {
    getInstance: jest.fn().mockReturnValue({}),
  },
}));

describe('HealthController', () => {
  let healthController: HealthController;
  let mockReq: Request;
  let mockRes: Response;

  beforeEach(() => {
    healthController = HealthController.getInstance();
    mockReq = {} as Request;
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBasicHealth', () => {
    it('should return healthy status when all services are healthy', async () => {
      const mockHealthCheck: IHealthCheck = {
        name: 'overall',
        status: HealthStatus.HEALTHY,
        message: 'All services are healthy',
        timestamp: new Date(),
        details: {
          errors: 0,
          lastCheck: new Date(),
        },
      };

      jest.mocked(MonitoringService.getHealthChecks).mockReturnValue([mockHealthCheck]);

      await healthController.getBasicHealth(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HealthStatus.HEALTHY,
          timestamp: expect.any(String),
        })
      );
    });

    it('should return unhealthy status when error occurs', async () => {
      jest.mocked(MonitoringService.getHealthChecks).mockImplementation(() => {
        throw new Error('Test error');
      });

      await healthController.getBasicHealth(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HealthStatus.UNHEALTHY,
          error: 'Failed to get health status',
        })
      );
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health status for all services', async () => {
      const mockHealthChecks: IHealthCheck[] = [
        {
          name: 'overall',
          status: HealthStatus.HEALTHY,
          message: 'All services are healthy',
          timestamp: new Date(),
          details: {
            errors: 0,
            lastCheck: new Date(),
          },
        },
        {
          name: 'batch-processor',
          status: HealthStatus.HEALTHY,
          message: 'Batch processor is running normally',
          timestamp: new Date(),
          details: {
            errors: 0,
            lastCheck: new Date(),
          },
        },
      ];

      jest.mocked(MonitoringService.getHealthChecks).mockReturnValue(mockHealthChecks);
      jest.mocked(MonitoringService.collectMetrics).mockResolvedValue();

      await healthController.getDetailedHealth(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HealthStatus.HEALTHY,
          services: expect.arrayContaining([
            expect.objectContaining({
              name: 'batch-processor',
              status: HealthStatus.HEALTHY,
            }),
          ]),
        })
      );
    });

    it('should return error when health check fails', async () => {
      jest.mocked(MonitoringService.getHealthChecks).mockImplementation(() => {
        throw new Error('Test error');
      });

      await healthController.getDetailedHealth(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HealthStatus.UNHEALTHY,
          error: 'Failed to get detailed health status',
        })
      );
    });
  });

  describe('getServiceHealth', () => {
    it('should return health status for specific service', async () => {
      const mockHealthCheck: IHealthCheck = {
        name: 'batch-processor',
        status: HealthStatus.HEALTHY,
        message: 'Batch processor is running normally',
        timestamp: new Date(),
        details: {
          errors: 0,
          lastCheck: new Date(),
        },
      };

      mockReq.params = { service: 'batch-processor' };
      jest.mocked(MonitoringService.getHealthChecks).mockReturnValue([mockHealthCheck]);

      await healthController.getServiceHealth(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'batch-processor',
          status: HealthStatus.HEALTHY,
        })
      );
    });

    it('should return 404 when service not found', async () => {
      mockReq.params = { service: 'non-existent' };
      jest.mocked(MonitoringService.getHealthChecks).mockReturnValue([]);

      await healthController.getServiceHealth(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Health check not found for service: non-existent',
        })
      );
    });

    it('should return 500 when error occurs', async () => {
      mockReq.params = { service: 'batch-processor' };
      jest.mocked(MonitoringService.getHealthChecks).mockImplementation(() => {
        throw new Error('Test error');
      });

      await healthController.getServiceHealth(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HealthStatus.UNHEALTHY,
          error: 'Failed to get service health status',
        })
      );
    });
  });
});
