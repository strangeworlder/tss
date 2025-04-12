import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { EncryptionService, EncryptionEvent, IEncryptionKey } from '../EncryptionService';
import ErrorHandler, { ErrorCategory, ErrorSeverity } from '../ErrorHandler';
import MonitoringService from '../MonitoringService';

// Mock crypto
jest.mock('crypto', () => {
  return {
    randomUUID: jest.fn().mockReturnValue('test-uuid'),
    randomBytes: jest.fn().mockReturnValue(Buffer.from('test-key')),
    createCipheriv: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue('encrypted'),
      final: jest.fn().mockReturnValue('data'),
      getAuthTag: jest.fn().mockReturnValue(Buffer.from('auth-tag')),
    }),
    createDecipheriv: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue('decrypted'),
      final: jest.fn().mockReturnValue('data'),
      setAuthTag: jest.fn(),
    }),
  };
});

// Mock ErrorHandler
jest.mock('../ErrorHandler', () => {
  return {
    ErrorHandler: {
      getInstance: jest.fn().mockReturnValue({
        handleError: jest.fn(),
      }),
    },
    ErrorCategory: {
      SECURITY: 'security',
    },
    ErrorSeverity: {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical',
    },
  };
});

// Mock MonitoringService
jest.mock('../MonitoringService', () => {
  return {
    MonitoringService: {
      getInstance: jest.fn().mockReturnValue({
        updateSecurityMetrics: jest.fn(),
      }),
    },
  };
});

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;
  let errorHandler: typeof ErrorHandler;
  let monitoringService: typeof MonitoringService;

  beforeEach(() => {
    // Reset the singleton instance for each test
    (EncryptionService as any).instance = null;
    encryptionService = EncryptionService.getInstance();
    errorHandler = ErrorHandler;
    monitoringService = MonitoringService;

    // Clear all event listeners
    encryptionService.removeAllListeners();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Key Management', () => {
    it('should create a key on initialization', () => {
      const eventSpy = jest.fn();
      encryptionService.on(EncryptionEvent.KEY_CREATED, eventSpy);

      // Reset the singleton instance to trigger initialization
      (EncryptionService as any).instance = null;
      encryptionService = EncryptionService.getInstance();

      expect(encryptionService.getActiveKeyId()).toBeDefined();
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          keyId: expect.any(String),
          createdAt: expect.any(Date),
        })
      );
    });

    it('should rotate key', () => {
      const eventSpy = jest.fn();
      encryptionService.on(EncryptionEvent.KEY_ROTATED, eventSpy);

      const oldKeyId = encryptionService.getActiveKeyId();
      const newKeyId = encryptionService.rotateKey();

      expect(newKeyId).toBeDefined();
      expect(newKeyId).not.toBe(oldKeyId);
      expect(encryptionService.getActiveKeyId()).toBe(newKeyId);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          oldKeyId,
          newKeyId,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should expire key', () => {
      const eventSpy = jest.fn();
      encryptionService.on(EncryptionEvent.KEY_EXPIRED, eventSpy);

      const keyId = encryptionService.getActiveKeyId();
      const result = encryptionService.expireKey(keyId as string);

      expect(result).toBe(true);
      expect(encryptionService.getActiveKeyId()).not.toBe(keyId);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          keyId,
          timestamp: expect.any(Date),
        })
      );
    });
  });

  describe('Encryption and Decryption', () => {
    it('should encrypt data', () => {
      const data = 'test data';
      const result = encryptionService.encrypt(data);

      expect(result.encryptedData).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.keyId).toBeDefined();
      expect(result.algorithm).toBe('aes-256-gcm');
    });

    it('should decrypt data', () => {
      const data = 'test data';
      const encrypted = encryptionService.encrypt(data);

      const decrypted = encryptionService.decrypt(
        encrypted.encryptedData,
        encrypted.iv,
        encrypted.keyId
      );

      expect(decrypted).toBe(data);
    });

    it('should handle encryption errors', () => {
      const eventSpy = jest.fn();
      encryptionService.on(EncryptionEvent.ENCRYPTION_ERROR, eventSpy);

      // Mock crypto.createCipheriv to throw an error
      const crypto = require('node:crypto');
      crypto.createCipheriv.mockImplementationOnce(() => {
        throw new Error('Encryption error');
      });

      expect(() => encryptionService.encrypt('test data')).toThrow('Encryption failed');
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Encryption error',
          timestamp: expect.any(Date),
        })
      );
    });

    it('should handle decryption errors', () => {
      const eventSpy = jest.fn();
      encryptionService.on(EncryptionEvent.DECRYPTION_ERROR, eventSpy);

      // Mock crypto.createDecipheriv to throw an error
      const crypto = require('node:crypto');
      crypto.createDecipheriv.mockImplementationOnce(() => {
        throw new Error('Decryption error');
      });

      const encrypted = encryptionService.encrypt('test data');

      expect(() =>
        encryptionService.decrypt(encrypted.encryptedData, encrypted.iv, encrypted.keyId)
      ).toThrow('Decryption failed');

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Decryption error',
          keyId: encrypted.keyId,
          timestamp: expect.any(Date),
        })
      );
    });
  });

  describe('Field-level Encryption', () => {
    it('should encrypt field', () => {
      const value = 'sensitive data';
      const encrypted = encryptionService.encryptField(value);

      expect(typeof encrypted).toBe('string');

      // Parse the JSON string
      const data = JSON.parse(encrypted);

      expect(data.data).toBeDefined();
      expect(data.iv).toBeDefined();
      expect(data.keyId).toBeDefined();
      expect(data.algorithm).toBe('aes-256-gcm');
    });

    it('should decrypt field', () => {
      const value = 'sensitive data';
      const encrypted = encryptionService.encryptField(value);

      const decrypted = encryptionService.decryptField(encrypted);

      expect(decrypted).toBe(value);
    });

    it('should handle invalid field format', () => {
      expect(() => encryptionService.decryptField('invalid json')).toThrow(
        'Field decryption failed'
      );
    });
  });

  describe('Utility Methods', () => {
    it('should get active key ID', () => {
      const keyId = encryptionService.getActiveKeyId();

      expect(keyId).toBeDefined();
    });

    it('should get all keys', () => {
      const keys = encryptionService.getKeys();

      expect(keys.length).toBeGreaterThan(0);
      expect(keys[0]).toHaveProperty('id');
      expect(keys[0]).toHaveProperty('key');
      expect(keys[0]).toHaveProperty('createdAt');
      expect(keys[0]).toHaveProperty('status');
    });

    it('should get key by ID', () => {
      const keyId = encryptionService.getActiveKeyId();

      if (keyId) {
        const key = encryptionService.getKey(keyId);

        expect(key).toBeDefined();
        expect(key?.id).toBe(keyId);
      }
    });
  });
});
