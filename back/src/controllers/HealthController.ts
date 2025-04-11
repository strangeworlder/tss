import type { Request, Response } from 'express';
import MonitoringService, {
  HealthStatus,
  type IHealthCheck,
  type IPerformanceMetrics,
} from '../services/MonitoringService';
import ErrorHandler from '../services/ErrorHandler';
import BatchProcessor from '../services/BatchProcessor';
import SchedulingService from '../services/SchedulingService';
import PublicationService from '../services/PublicationService';

export class HealthController {
  private static instance: HealthController;
  private monitoringService: typeof MonitoringService;
  private errorHandler: typeof ErrorHandler;
  private batchProcessor: typeof BatchProcessor;
  private schedulingService: typeof SchedulingService;
  private publicationService: typeof PublicationService;

  private constructor() {
    this.monitoringService = MonitoringService;
    this.errorHandler = ErrorHandler;
    this.batchProcessor = BatchProcessor;
    this.schedulingService = SchedulingService;
    this.publicationService = PublicationService;
  }

  public static getInstance(): HealthController {
    if (!HealthController.instance) {
      HealthController.instance = new HealthController();
    }
    return HealthController.instance;
  }

  /**
   * Get basic health status
   */
  public async getBasicHealth(req: Request, res: Response): Promise<void> {
    try {
      // Get overall health status
      const healthChecks = this.monitoringService.getHealthChecks();
      const overallHealth = healthChecks.find((check) => check.name === 'overall');
      const status = overallHealth?.status || HealthStatus.HEALTHY;

      res.json({
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting basic health status:', error);
      res.status(500).json({
        status: HealthStatus.UNHEALTHY,
        error: 'Failed to get health status',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get detailed health status including all service health checks
   */
  public async getDetailedHealth(req: Request, res: Response): Promise<void> {
    try {
      // Collect latest metrics
      await this.monitoringService.collectMetrics();

      // Get all health checks
      const healthChecks = this.monitoringService.getHealthChecks();
      const overallHealth = healthChecks.find((check) => check.name === 'overall');

      // Get performance metrics
      const metrics = await this.getPerformanceMetrics();

      res.json({
        status: overallHealth?.status || HealthStatus.HEALTHY,
        timestamp: new Date().toISOString(),
        services: healthChecks.filter((check) => check.name !== 'overall'),
        metrics,
      });
    } catch (error) {
      console.error('Error getting detailed health status:', error);
      res.status(500).json({
        status: HealthStatus.UNHEALTHY,
        error: 'Failed to get detailed health status',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get service-specific health status
   */
  public async getServiceHealth(req: Request, res: Response): Promise<void> {
    try {
      const { service } = req.params;
      const healthChecks = this.monitoringService.getHealthChecks();
      const serviceHealth = healthChecks.find((check) => check.name === service);

      if (!serviceHealth) {
        res.status(404).json({
          error: `Health check not found for service: ${service}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        ...serviceHealth,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error getting health status for service ${req.params.service}:`, error);
      res.status(500).json({
        status: HealthStatus.UNHEALTHY,
        error: 'Failed to get service health status',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(): Promise<IPerformanceMetrics> {
    const scheduledContent = await this.schedulingService.getScheduledContent();

    return {
      scheduledContentCount: scheduledContent.length,
      publishedContentCount: 0, // This will be updated by MonitoringService
      errorCount: this.errorHandler.getErrorCount(),
      errorRate: this.errorHandler.getErrorRate(),
      batchProcessingTime: 0, // This will be updated by MonitoringService
      averagePublicationTime: 0, // This will be updated by MonitoringService
      timestamp: new Date(),
    };
  }
}
