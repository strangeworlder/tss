import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MonitoringService, {
  HealthStatus,
  type IHealthCheck,
  IPerformanceMetrics,
} from '../MonitoringService';
import ErrorHandler from '../ErrorHandler';
import BatchProcessor from '../BatchProcessor';
import PublicationService from '../PublicationService';
import SchedulingService from '../SchedulingService';

// Mock the dependencies
vi.mock('../ErrorHandler', () => ({
  default: {
    on: vi.fn(),
    handleError: vi.fn(),
    getErrorCount: vi.fn().mockReturnValue(0),
    getErrorRate: vi.fn().mockReturnValue(0),
    ErrorSeverity: {
      CRITICAL: 'critical',
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low',
    },
    ErrorCategory: {
      MONITORING: 'monitoring',
    },
  },
}));

vi.mock('../BatchProcessor', () => ({
  default: {
    on: vi.fn(),
    once: vi.fn(),
    emit: vi.fn(),
  },
}));

vi.mock('../PublicationService', () => ({
  default: {
    on: vi.fn(),
    emit: vi.fn(),
  },
}));

vi.mock('../SchedulingService', () => ({
  default: {
    getScheduledContent: vi.fn().mockResolvedValue([]),
  },
}));

describe('MonitoringService', () => {
  let monitoringService: typeof MonitoringService;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Get a fresh instance
    monitoringService = MonitoringService;

    // Spy on event emitter methods
    vi.spyOn(monitoringService, 'emit');
  });

  afterEach(() => {
    // Stop the service if it's running
    monitoringService.stop();
  });

  describe('start', () => {
    it('should start the monitoring service', () => {
      // Start the service
      monitoringService.start();

      // Check that the started event was emitted
      expect(monitoringService.emit).toHaveBeenCalledWith('started', expect.any(Object));

      // Stop the service
      monitoringService.stop();
    });

    it('should not start if already running', () => {
      // Start the service
      monitoringService.start();

      // Try to start again
      monitoringService.start();

      // Check that the started event was only emitted once
      expect(monitoringService.emit).toHaveBeenCalledTimes(1);

      // Stop the service
      monitoringService.stop();
    });
  });

  describe('stop', () => {
    it('should stop the monitoring service', () => {
      // Start the service
      monitoringService.start();

      // Stop the service
      monitoringService.stop();

      // Check that the stopped event was emitted
      expect(monitoringService.emit).toHaveBeenCalledWith('stopped', expect.any(Object));
    });

    it('should do nothing if not running', () => {
      // Stop the service
      monitoringService.stop();

      // Check that no events were emitted
      expect(monitoringService.emit).not.toHaveBeenCalled();
    });
  });

  describe('collectMetrics', () => {
    it('should collect metrics from all services', async () => {
      // Mock the getScheduledContent method
      vi.mocked(SchedulingService.getScheduledContent).mockResolvedValue([
        {
          id: 'post1',
          type: 'post' as const,
          content: 'Test post content',
          publishAt: new Date(),
          status: 'scheduled',
          timezone: 'UTC',
          version: 1,
          authorId: 'user1',
        },
      ]);

      // Collect metrics
      await monitoringService.collectMetrics();

      // Check that the metrics event was emitted
      expect(monitoringService.emit).toHaveBeenCalledWith(
        'metrics',
        expect.objectContaining({
          scheduledContentCount: 1,
          publishedContentCount: 0,
          errorCount: 0,
          errorRate: 0,
          batchProcessingTime: 0,
          averagePublicationTime: 0,
        })
      );

      // Check that the overall health check was updated
      expect(monitoringService.emit).toHaveBeenCalledWith(
        'healthCheckUpdated',
        expect.objectContaining({
          name: 'overall',
          healthCheck: expect.objectContaining({
            status: HealthStatus.HEALTHY,
          }),
        })
      );
    });
  });

  describe('updateHealthCheck', () => {
    it('should update a health check', () => {
      // Create a health check
      const healthCheck: IHealthCheck = {
        name: 'test',
        status: HealthStatus.HEALTHY,
        message: 'Test health check',
        timestamp: new Date(),
      };

      // Update the health check
      monitoringService.updateHealthCheck('test', healthCheck);

      // Check that the healthCheckUpdated event was emitted
      expect(monitoringService.emit).toHaveBeenCalledWith('healthCheckUpdated', {
        name: 'test',
        healthCheck,
      });

      // Check that the health check was stored
      const healthChecks = monitoringService.getHealthChecks();
      expect(healthChecks).toContainEqual(healthCheck);
    });
  });

  describe('getHealthChecks', () => {
    it('should return all health checks', () => {
      // Create health checks
      const healthCheck1: IHealthCheck = {
        name: 'test1',
        status: HealthStatus.HEALTHY,
        message: 'Test health check 1',
        timestamp: new Date(),
      };

      const healthCheck2: IHealthCheck = {
        name: 'test2',
        status: HealthStatus.DEGRADED,
        message: 'Test health check 2',
        timestamp: new Date(),
      };

      // Update the health checks
      monitoringService.updateHealthCheck('test1', healthCheck1);
      monitoringService.updateHealthCheck('test2', healthCheck2);

      // Get the health checks
      const healthChecks = monitoringService.getHealthChecks();

      // Check that the health checks were returned
      expect(healthChecks).toHaveLength(2);
      expect(healthChecks).toContainEqual(healthCheck1);
      expect(healthChecks).toContainEqual(healthCheck2);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return the performance metrics', async () => {
      // Mock the getScheduledContent method
      vi.mocked(SchedulingService.getScheduledContent).mockResolvedValue([
        {
          id: 'post1',
          type: 'post' as const,
          content: 'Test post content',
          publishAt: new Date(),
          status: 'scheduled',
          timezone: 'UTC',
          version: 1,
          authorId: 'user1',
        },
      ]);

      // Collect metrics
      await monitoringService.collectMetrics();

      // Get the performance metrics
      const metrics = monitoringService.getPerformanceMetrics();

      // Check that the metrics were returned
      expect(metrics).not.toBeNull();
      expect(metrics).toHaveProperty('scheduledContentCount', 1);
      expect(metrics).toHaveProperty('publishedContentCount', 0);
      expect(metrics).toHaveProperty('errorCount', 0);
      expect(metrics).toHaveProperty('errorRate', 0);
      expect(metrics).toHaveProperty('batchProcessingTime', 0);
      expect(metrics).toHaveProperty('averagePublicationTime', 0);
      expect(metrics).toHaveProperty('timestamp');
    });
  });

  describe('setMonitoringInterval', () => {
    it('should set the monitoring interval', () => {
      // Set the monitoring interval
      monitoringService.setMonitoringInterval(120000); // 2 minutes

      // Check that the intervalChanged event was emitted
      expect(monitoringService.emit).toHaveBeenCalledWith(
        'intervalChanged',
        expect.objectContaining({
          newInterval: 120000,
        })
      );
    });

    it('should not set the monitoring interval if it is less than or equal to 0', () => {
      // Set the monitoring interval
      monitoringService.setMonitoringInterval(0);

      // Check that the intervalChanged event was not emitted
      expect(monitoringService.emit).not.toHaveBeenCalledWith(
        'intervalChanged',
        expect.any(Object)
      );
    });

    it('should restart the interval if it is running', () => {
      // Start the service
      monitoringService.start();

      // Set the monitoring interval
      monitoringService.setMonitoringInterval(120000); // 2 minutes

      // Check that the events were emitted
      expect(monitoringService.emit).toHaveBeenCalledWith('stopped', expect.any(Object));
      expect(monitoringService.emit).toHaveBeenCalledWith('started', expect.any(Object));
      expect(monitoringService.emit).toHaveBeenCalledWith('intervalChanged', expect.any(Object));

      // Stop the service
      monitoringService.stop();
    });
  });
});
