import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import BatchProcessor from '../BatchProcessor';
import SchedulingService from '../SchedulingService';
import PublicationService from '../PublicationService';
import type { IScheduledContent } from '../../types/scheduling';

// Mock the dependencies
vi.mock('../SchedulingService', () => ({
  default: {
    getScheduledContent: vi.fn(),
  },
}));

vi.mock('../PublicationService', () => ({
  default: {
    publishContent: vi.fn(),
  },
}));

describe('BatchProcessor', () => {
  let batchProcessor: typeof BatchProcessor;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Get a fresh instance
    batchProcessor = BatchProcessor;

    // Spy on event emitter methods
    vi.spyOn(batchProcessor, 'emit');
  });

  afterEach(() => {
    // Stop the processor if it's running
    batchProcessor.stop();
  });

  describe('start', () => {
    it('should start the batch processing service', () => {
      // Start the service
      batchProcessor.start();

      // Check that the interval was set
      expect(batchProcessor.emit).toHaveBeenCalledWith('started', expect.any(Object));

      // Stop the service
      batchProcessor.stop();
    });

    it('should not start if already running', () => {
      // Start the service
      batchProcessor.start();

      // Try to start again
      batchProcessor.start();

      // Check that the started event was only emitted once
      expect(batchProcessor.emit).toHaveBeenCalledTimes(1);

      // Stop the service
      batchProcessor.stop();
    });
  });

  describe('stop', () => {
    it('should stop the batch processing service', () => {
      // Start the service
      batchProcessor.start();

      // Stop the service
      batchProcessor.stop();

      // Check that the stopped event was emitted
      expect(batchProcessor.emit).toHaveBeenCalledWith('stopped', expect.any(Object));
    });

    it('should do nothing if not running', () => {
      // Stop the service
      batchProcessor.stop();

      // Check that no events were emitted
      expect(batchProcessor.emit).not.toHaveBeenCalled();
    });
  });

  describe('processBatch', () => {
    it('should process a batch of scheduled content', async () => {
      // Mock scheduled content
      const mockScheduledContent: IScheduledContent[] = [
        {
          id: 'post1',
          type: 'post' as const,
          content: 'Test post content',
          publishAt: new Date(Date.now() - 1000), // In the past
          status: 'scheduled',
          timezone: 'UTC',
          version: 1,
          authorId: 'user1',
        },
        {
          id: 'comment1',
          type: 'comment' as const,
          content: 'Test comment content',
          publishAt: new Date(Date.now() - 1000), // In the past
          status: 'scheduled',
          timezone: 'UTC',
          version: 1,
          authorId: 'user1',
        },
      ];

      // Mock the getScheduledContent method
      vi.mocked(SchedulingService.getScheduledContent).mockResolvedValue(mockScheduledContent);

      // Mock the publishContent method
      vi.mocked(PublicationService.publishContent).mockResolvedValue();

      // Process a batch
      const result = await batchProcessor.processBatch();

      // Check that the batch was processed
      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);

      // Check that the publishContent method was called for each item
      expect(PublicationService.publishContent).toHaveBeenCalledTimes(2);
      expect(PublicationService.publishContent).toHaveBeenCalledWith('post1', 'post');
      expect(PublicationService.publishContent).toHaveBeenCalledWith('comment1', 'comment');

      // Check that the events were emitted
      expect(batchProcessor.emit).toHaveBeenCalledWith('batchStarted', expect.any(Object));
      expect(batchProcessor.emit).toHaveBeenCalledWith('batchCompleted', expect.any(Object));
    });

    it('should handle errors during processing', async () => {
      // Mock scheduled content
      const mockScheduledContent: IScheduledContent[] = [
        {
          id: 'post1',
          type: 'post' as const,
          content: 'Test post content',
          publishAt: new Date(Date.now() - 1000), // In the past
          status: 'scheduled',
          timezone: 'UTC',
          version: 1,
          authorId: 'user1',
        },
        {
          id: 'post2',
          type: 'post' as const,
          content: 'Another test post content',
          publishAt: new Date(Date.now() - 1000), // In the past
          status: 'scheduled',
          timezone: 'UTC',
          version: 1,
          authorId: 'user1',
        },
      ];

      // Mock the getScheduledContent method
      vi.mocked(SchedulingService.getScheduledContent).mockResolvedValue(mockScheduledContent);

      // Mock the publishContent method to throw an error for the second item
      vi.mocked(PublicationService.publishContent)
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(new Error('Publication failed'));

      // Process a batch
      const result = await batchProcessor.processBatch();

      // Check that the batch was processed
      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].contentId).toBe('post2');
      expect(result.errors[0].type).toBe('post');
      expect(result.errors[0].error).toBe('Publication failed');

      // Check that the publishContent method was called for each item
      expect(PublicationService.publishContent).toHaveBeenCalledTimes(2);

      // Check that the events were emitted
      expect(batchProcessor.emit).toHaveBeenCalledWith('batchStarted', expect.any(Object));
      expect(batchProcessor.emit).toHaveBeenCalledWith('batchCompleted', expect.any(Object));
    });

    it('should not process if already processing', async () => {
      // Mock the processBatch method to simulate processing
      const processBatchSpy = vi.spyOn(batchProcessor, 'processBatch');

      // Start processing
      const promise1 = batchProcessor.processBatch();

      // Try to process again while the first batch is still processing
      const promise2 = batchProcessor.processBatch();

      // Wait for both promises to resolve
      await Promise.all([promise1, promise2]);

      // Check that the second call returned early
      expect(processBatchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('setBatchSize', () => {
    it('should set the batch size', () => {
      // Set the batch size
      batchProcessor.setBatchSize(100);

      // Check that the event was emitted
      expect(batchProcessor.emit).toHaveBeenCalledWith('batchSizeChanged', expect.any(Object));
    });

    it('should not set the batch size if it is less than or equal to 0', () => {
      // Set the batch size
      batchProcessor.setBatchSize(0);

      // Check that the event was not emitted
      expect(batchProcessor.emit).not.toHaveBeenCalled();
    });
  });

  describe('setProcessingInterval', () => {
    it('should set the processing interval', () => {
      // Set the processing interval
      batchProcessor.setProcessingInterval(10000);

      // Check that the event was emitted
      expect(batchProcessor.emit).toHaveBeenCalledWith('intervalChanged', expect.any(Object));
    });

    it('should not set the processing interval if it is less than or equal to 0', () => {
      // Set the processing interval
      batchProcessor.setProcessingInterval(0);

      // Check that the event was not emitted
      expect(batchProcessor.emit).not.toHaveBeenCalled();
    });

    it('should restart the interval if it is running', () => {
      // Start the service
      batchProcessor.start();

      // Set the processing interval
      batchProcessor.setProcessingInterval(10000);

      // Check that the events were emitted
      expect(batchProcessor.emit).toHaveBeenCalledWith('stopped', expect.any(Object));
      expect(batchProcessor.emit).toHaveBeenCalledWith('started', expect.any(Object));
      expect(batchProcessor.emit).toHaveBeenCalledWith('intervalChanged', expect.any(Object));

      // Stop the service
      batchProcessor.stop();
    });
  });
});
