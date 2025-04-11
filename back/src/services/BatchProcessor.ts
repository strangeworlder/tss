import { EventEmitter } from 'node:events';
import PublicationService from './PublicationService';
import SchedulingService from './SchedulingService';
import type { IScheduledContent } from '../types/scheduling';

export interface IBatchProcessingResult {
  processed: number;
  failed: number;
  errors: Array<{ contentId: string; type: 'post' | 'comment'; error: string }>;
}

class BatchProcessor extends EventEmitter {
  private static instance: BatchProcessor;
  private isProcessing = false;
  private batchSize = 50;
  private processingInterval: number = 5 * 60 * 1000; // 5 minutes
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {
    super();
  }

  public static getInstance(): BatchProcessor {
    if (!BatchProcessor.instance) {
      BatchProcessor.instance = new BatchProcessor();
    }
    return BatchProcessor.instance;
  }

  /**
   * Start the batch processing service
   * @returns void
   */
  public start(): void {
    if (this.intervalId) {
      return; // Already running
    }

    this.intervalId = setInterval(() => {
      this.processBatch().catch((error) => {
        this.emit('error', { message: 'Batch processing error', error });
      });
    }, this.processingInterval);

    this.emit('started', { timestamp: new Date() });
  }

  /**
   * Stop the batch processing service
   * @returns void
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.emit('stopped', { timestamp: new Date() });
    }
  }

  /**
   * Process a batch of scheduled content
   * @returns Promise<IBatchProcessingResult>
   */
  public async processBatch(): Promise<IBatchProcessingResult> {
    if (this.isProcessing) {
      return { processed: 0, failed: 0, errors: [] };
    }

    this.isProcessing = true;
    const result: IBatchProcessingResult = {
      processed: 0,
      failed: 0,
      errors: [],
    };

    try {
      const scheduledContent = await SchedulingService.getScheduledContent();
      const contentToProcess = scheduledContent
        .filter((content) => content.publishAt <= new Date())
        .slice(0, this.batchSize);

      this.emit('batchStarted', {
        batchSize: contentToProcess.length,
        timestamp: new Date(),
      });

      for (const content of contentToProcess) {
        try {
          await PublicationService.publishContent(content.id, content.type);
          result.processed++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            contentId: content.id,
            type: content.type,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      this.emit('batchCompleted', {
        result,
        timestamp: new Date(),
      });
    } catch (error) {
      this.emit('error', {
        message: 'Batch processing error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });
    } finally {
      this.isProcessing = false;
    }

    return result;
  }

  /**
   * Set the batch size
   * @param size The new batch size
   * @returns void
   */
  public setBatchSize(size: number): void {
    if (size > 0) {
      this.batchSize = size;
      this.emit('batchSizeChanged', {
        newSize: size,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Set the processing interval
   * @param interval The new interval in milliseconds
   * @returns void
   */
  public setProcessingInterval(interval: number): void {
    if (interval > 0) {
      this.processingInterval = interval;

      // Restart the interval if it's running
      if (this.intervalId) {
        this.stop();
        this.start();
      }

      this.emit('intervalChanged', {
        newInterval: interval,
        timestamp: new Date(),
      });
    }
  }
}

export default BatchProcessor.getInstance();
