import { EventEmitter } from 'node:events';
import ErrorHandler, { ErrorCategory, ErrorSeverity, type IErrorDetails } from './ErrorHandler';
import MonitoringService from './MonitoringService';
import crypto from 'node:crypto';

// Interfaces
export interface IEncryptionKey {
  id: string;
  key: Buffer;
  createdAt: Date;
  expiresAt: Date | null;
  status: 'active' | 'rotating' | 'expired';
}

export interface IEncryptionResult {
  encryptedData: string;
  iv: string;
  keyId: string;
  algorithm: string;
}

// Events
export enum EncryptionEvent {
  KEY_CREATED = 'keyCreated',
  KEY_ROTATED = 'keyRotated',
  KEY_EXPIRED = 'keyExpired',
  ENCRYPTION_ERROR = 'encryptionError',
  DECRYPTION_ERROR = 'decryptionError',
}

// Singleton class
export class EncryptionService extends EventEmitter {
  private static instance: EncryptionService;
  private errorHandler: typeof ErrorHandler;
  private monitoringService: typeof MonitoringService;
  private keys: Map<string, IEncryptionKey>;
  private activeKeyId: string | null;
  private algorithm = 'aes-256-gcm';
  private keyLength = 32; // 256 bits
  private ivLength = 12; // 96 bits for GCM
  private authTagLength = 16; // 128 bits for GCM

  private constructor() {
    super();
    this.errorHandler = ErrorHandler;
    this.monitoringService = MonitoringService;
    this.keys = new Map();
    this.activeKeyId = null;

    // Initialize with a default key
    this.createKey();
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // Key management methods
  private createKey(): string {
    try {
      const id = crypto.randomUUID();
      const key = crypto.randomBytes(this.keyLength);
      const now = new Date();

      const encryptionKey: IEncryptionKey = {
        id,
        key,
        createdAt: now,
        expiresAt: null,
        status: 'active',
      };

      this.keys.set(id, encryptionKey);
      this.activeKeyId = id;

      this.emit(EncryptionEvent.KEY_CREATED, {
        keyId: id,
        createdAt: now,
      });

      return id;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create encryption key');
      const errorDetails: Partial<IErrorDetails> = {
        message: 'Failed to create encryption key',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.HIGH,
        context: { error: err.message },
      };
      this.errorHandler.handleError(err, errorDetails);

      throw err;
    }
  }

  public rotateKey(): string {
    try {
      if (!this.activeKeyId) {
        return this.createKey();
      }

      const oldKey = this.keys.get(this.activeKeyId);
      if (!oldKey) {
        return this.createKey();
      }

      // Create a new key
      const newKeyId = this.createKey();
      const newKey = this.keys.get(newKeyId);

      if (!newKey) {
        throw new Error('Failed to create new key during rotation');
      }

      // Mark the old key as rotating
      oldKey.status = 'rotating';
      this.keys.set(this.activeKeyId, oldKey);

      this.emit(EncryptionEvent.KEY_ROTATED, {
        oldKeyId: this.activeKeyId,
        newKeyId,
        timestamp: new Date(),
      });

      return newKeyId;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to rotate encryption key');
      const errorDetails: Partial<IErrorDetails> = {
        message: 'Failed to rotate encryption key',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.HIGH,
        context: { error: err.message },
      };
      this.errorHandler.handleError(err, errorDetails);

      throw err;
    }
  }

  public expireKey(keyId: string): boolean {
    try {
      const key = this.keys.get(keyId);
      if (!key) {
        return false;
      }

      key.status = 'expired';
      key.expiresAt = new Date();
      this.keys.set(keyId, key);

      // If the expired key was the active key, create a new one
      if (this.activeKeyId === keyId) {
        this.createKey();
      }

      this.emit(EncryptionEvent.KEY_EXPIRED, {
        keyId,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to expire encryption key');
      const errorDetails: Partial<IErrorDetails> = {
        message: 'Failed to expire encryption key',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        context: { error: err.message },
      };
      this.errorHandler.handleError(err, errorDetails);

      return false;
    }
  }

  // Encryption methods
  public encrypt(data: string): IEncryptionResult {
    try {
      if (!this.activeKeyId) {
        this.createKey();
      }

      // Ensure activeKeyId is defined after possible createKey call
      if (!this.activeKeyId) {
        throw new Error('Failed to create active encryption key');
      }

      const key = this.keys.get(this.activeKeyId);
      if (!key) {
        throw new Error('No active encryption key found');
      }

      // Generate a random IV
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key.key, iv);

      // Encrypt the data
      let encryptedData = cipher.update(data, 'utf8', 'base64');
      encryptedData += cipher.final('base64');

      // Get the auth tag (TypeScript doesn't have this method in its types, but Node.js provides it)
      const authTag = (cipher as any).getAuthTag();

      // Combine the encrypted data and auth tag
      const combinedData = `${encryptedData}:${authTag.toString('base64')}`;

      const result: IEncryptionResult = {
        encryptedData: combinedData,
        iv: iv.toString('base64'),
        keyId: this.activeKeyId, // Now we're sure activeKeyId is defined
        algorithm: this.algorithm,
      };

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Encryption failed');
      const errorDetails: Partial<IErrorDetails> = {
        message: 'Encryption failed',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.HIGH,
        context: { error: err.message },
      };
      this.errorHandler.handleError(err, errorDetails);

      this.emit(EncryptionEvent.ENCRYPTION_ERROR, {
        error: err.message,
        timestamp: new Date(),
      });

      throw err;
    }
  }

  public decrypt(encryptedData: string, iv: string, keyId: string): string {
    try {
      const key = this.keys.get(keyId);
      if (!key) {
        throw new Error(`Encryption key not found: ${keyId}`);
      }

      if (key.status === 'expired') {
        throw new Error(`Encryption key has expired: ${keyId}`);
      }

      // Split the encrypted data and auth tag
      const [data, authTagBase64] = encryptedData.split(':');
      if (!data || !authTagBase64) {
        throw new Error('Invalid encrypted data format');
      }

      // Convert IV and auth tag from base64
      const ivBuffer = Buffer.from(iv, 'base64');
      const authTag = Buffer.from(authTagBase64, 'base64');

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key.key, ivBuffer);

      // Set the auth tag
      (decipher as any).setAuthTag(authTag);

      // Decrypt the data
      let decryptedData = decipher.update(data, 'base64', 'utf8');
      decryptedData += decipher.final('utf8');

      return decryptedData;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Decryption failed');
      const errorDetails: Partial<IErrorDetails> = {
        message: 'Decryption failed',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.HIGH,
        context: { error: err.message },
      };
      this.errorHandler.handleError(err, errorDetails);

      this.emit(EncryptionEvent.DECRYPTION_ERROR, {
        error: err.message,
        timestamp: new Date(),
      });

      throw err;
    }
  }

  // Field-level encryption
  public encryptField(value: string): string {
    try {
      const result = this.encrypt(value);

      // Return a JSON string with all the necessary information
      return JSON.stringify({
        data: result.encryptedData,
        iv: result.iv,
        keyId: result.keyId,
        algorithm: result.algorithm,
      });
    } catch (error) {
      const err = new Error('Field encryption failed');
      const errorDetails: Partial<IErrorDetails> = {
        message: 'Field encryption failed',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        context: { error: error instanceof Error ? error.message : String(error) },
      };
      this.errorHandler.handleError(err, errorDetails);

      throw err;
    }
  }

  public decryptField(encryptedField: string): string {
    try {
      // Parse the JSON string
      const data = JSON.parse(encryptedField);

      if (!data.data || !data.iv || !data.keyId || !data.algorithm) {
        throw new Error('Invalid encrypted field format');
      }

      // Decrypt the data
      return this.decrypt(data.data, data.iv, data.keyId);
    } catch (error) {
      const err = new Error('Field decryption failed');
      const errorDetails: Partial<IErrorDetails> = {
        message: 'Field decryption failed',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        context: { error: error instanceof Error ? error.message : String(error) },
      };
      this.errorHandler.handleError(err, errorDetails);

      throw err;
    }
  }

  // Utility methods
  public getActiveKeyId(): string | null {
    return this.activeKeyId;
  }

  public getKeys(): IEncryptionKey[] {
    return Array.from(this.keys.values());
  }

  public getKey(keyId: string): IEncryptionKey | null {
    try {
      return this.keys.get(keyId) || null;
    } catch (error) {
      const err = new Error('Failed to get encryption key');
      const errorDetails: Partial<IErrorDetails> = {
        message: 'Failed to get encryption key',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        context: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
      this.errorHandler.handleError(err, errorDetails);
      return null;
    }
  }

  public getActiveKey(): IEncryptionKey | null {
    try {
      if (!this.activeKeyId) {
        return null;
      }
      return this.keys.get(this.activeKeyId) || null;
    } catch (error) {
      const err = new Error('Failed to get active encryption key');
      const errorDetails: Partial<IErrorDetails> = {
        message: 'Failed to get active encryption key',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        context: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
      this.errorHandler.handleError(err, errorDetails);
      return null;
    }
  }

  public getAllKeys(): IEncryptionKey[] {
    try {
      return Array.from(this.keys.values());
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to get all encryption keys');
      const errorDetails: Partial<IErrorDetails> = {
        message: 'Failed to get all encryption keys',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        context: { error: err.message },
      };
      this.errorHandler.handleError(err, errorDetails);

      return [];
    }
  }
}
