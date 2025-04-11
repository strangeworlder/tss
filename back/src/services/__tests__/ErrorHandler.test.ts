import { vi, describe, it, expect, beforeEach } from 'vitest';
import ErrorHandler, { ErrorSeverity, ErrorCategory, IErrorDetails } from '../ErrorHandler';

describe('ErrorHandler', () => {
  let errorHandler: typeof ErrorHandler;

  beforeEach(() => {
    // Initialize the error handler
    errorHandler = ErrorHandler;

    // Reset the error handler
    errorHandler.resetErrorCount();

    // Spy on event emitter methods
    vi.spyOn(errorHandler, 'emit');
  });

  describe('handleError', () => {
    it('should handle an error with default details', () => {
      // Create an error
      const error = new Error('Test error');

      // Handle the error
      errorHandler.handleError(error);

      // Check that the error event was emitted
      expect(errorHandler.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          message: 'Test error',
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.UNKNOWN,
        })
      );

      // Check that category-specific events were emitted
      expect(errorHandler.emit).toHaveBeenCalledWith(
        `error:${ErrorCategory.UNKNOWN}`,
        expect.any(Object)
      );

      // Check that severity-specific events were emitted
      expect(errorHandler.emit).toHaveBeenCalledWith(
        `error:${ErrorSeverity.MEDIUM}`,
        expect.any(Object)
      );

      // Check that the error count was incremented
      expect(errorHandler.getErrorCount()).toBe(1);
    });

    it('should handle an error with custom details', () => {
      // Create an error
      const error = new Error('Test error');

      // Handle the error with custom details
      errorHandler.handleError(error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SCHEDULING,
        userId: 'user1',
        contentId: 'post1',
        contentType: 'post',
        context: { foo: 'bar' },
      });

      // Check that the error event was emitted
      expect(errorHandler.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          message: 'Test error',
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.SCHEDULING,
          userId: 'user1',
          contentId: 'post1',
          contentType: 'post',
          context: { foo: 'bar' },
        })
      );

      // Check that category-specific events were emitted
      expect(errorHandler.emit).toHaveBeenCalledWith(
        `error:${ErrorCategory.SCHEDULING}`,
        expect.any(Object)
      );

      // Check that severity-specific events were emitted
      expect(errorHandler.emit).toHaveBeenCalledWith(
        `error:${ErrorSeverity.HIGH}`,
        expect.any(Object)
      );
    });

    it('should emit an errorThresholdExceeded event when the threshold is exceeded', () => {
      // Set a low threshold for testing
      errorHandler.setErrorThreshold(2);

      // Handle multiple errors
      errorHandler.handleError(new Error('Error 1'));
      errorHandler.handleError(new Error('Error 2'));
      errorHandler.handleError(new Error('Error 3'));

      // Check that the errorThresholdExceeded event was emitted
      expect(errorHandler.emit).toHaveBeenCalledWith(
        'errorThresholdExceeded',
        expect.objectContaining({
          count: 3,
          threshold: 2,
        })
      );
    });
  });

  describe('setErrorThreshold', () => {
    it('should set the error threshold', () => {
      // Set the error threshold
      errorHandler.setErrorThreshold(200);

      // Check that the event was emitted
      expect(errorHandler.emit).toHaveBeenCalledWith(
        'errorThresholdChanged',
        expect.objectContaining({
          newThreshold: 200,
        })
      );
    });

    it('should not set the error threshold if it is less than or equal to 0', () => {
      // Set the error threshold
      errorHandler.setErrorThreshold(0);

      // Check that the event was not emitted
      expect(errorHandler.emit).not.toHaveBeenCalledWith(
        'errorThresholdChanged',
        expect.any(Object)
      );
    });
  });

  describe('setErrorWindow', () => {
    it('should set the error window', () => {
      // Set the error window
      errorHandler.setErrorWindow(7200000); // 2 hours

      // Check that the event was emitted
      expect(errorHandler.emit).toHaveBeenCalledWith(
        'errorWindowChanged',
        expect.objectContaining({
          newWindow: 7200000,
        })
      );
    });

    it('should not set the error window if it is less than or equal to 0', () => {
      // Set the error window
      errorHandler.setErrorWindow(0);

      // Check that the event was not emitted
      expect(errorHandler.emit).not.toHaveBeenCalledWith('errorWindowChanged', expect.any(Object));
    });
  });

  describe('getErrorCount', () => {
    it('should return the current error count', () => {
      // Handle multiple errors
      errorHandler.handleError(new Error('Error 1'));
      errorHandler.handleError(new Error('Error 2'));
      errorHandler.handleError(new Error('Error 3'));

      // Check that the error count is correct
      expect(errorHandler.getErrorCount()).toBe(3);
    });
  });

  describe('getErrorRate', () => {
    it('should return the current error rate', () => {
      // Set a small window for testing
      errorHandler.setErrorWindow(3600000); // 1 hour

      // Handle multiple errors
      errorHandler.handleError(new Error('Error 1'));
      errorHandler.handleError(new Error('Error 2'));
      errorHandler.handleError(new Error('Error 3'));

      // Check that the error rate is correct
      expect(errorHandler.getErrorRate()).toBe(3); // 3 errors per hour
    });
  });

  describe('resetErrorCount', () => {
    it('should reset the error count', () => {
      // Handle multiple errors
      errorHandler.handleError(new Error('Error 1'));
      errorHandler.handleError(new Error('Error 2'));
      errorHandler.handleError(new Error('Error 3'));

      // Reset the error count
      errorHandler.resetErrorCount();

      // Check that the error count is reset
      expect(errorHandler.getErrorCount()).toBe(0);

      // Check that the event was emitted
      expect(errorHandler.emit).toHaveBeenCalledWith('errorCountReset', expect.any(Object));
    });
  });
});
