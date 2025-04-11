import { EventEmitter } from 'node:events';
import ErrorHandler, { ErrorCategory, ErrorSeverity } from './ErrorHandler';
import MonitoringService, { HealthStatus } from './MonitoringService';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
export interface IRateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDuration: number;
}

export interface IAbusePattern {
  id: string;
  name: string;
  pattern: RegExp;
  severity: number;
  action: 'warn' | 'block' | 'ban';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountBlock {
  userId: string;
  reason: string;
  blockedUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIPRestriction {
  ipAddress: string;
  reason: string;
  blockedUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISecurityAudit {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, unknown>;
}

// Events
export enum SecurityEvent {
  RATE_LIMIT_EXCEEDED = 'rateLimitExceeded',
  ABUSE_DETECTED = 'abuseDetected',
  ACCOUNT_BLOCKED = 'accountBlocked',
  IP_BLOCKED = 'ipBlocked',
  SECURITY_AUDIT = 'securityAudit',
  PATTERN_UPDATED = 'patternUpdated',
  RESTRICTION_ADDED = 'restrictionAdded',
  RESTRICTION_REMOVED = 'restrictionRemoved',
}

// Singleton class
export class SecurityService extends EventEmitter {
  private static instance: SecurityService;
  private redis: Redis;
  private errorHandler: typeof ErrorHandler;
  private monitoringService: typeof MonitoringService;
  private rateLimitConfigs: Map<string, IRateLimitConfig>;
  private abusePatterns: Map<string, IAbusePattern>;
  private ipRestrictions: Map<string, IIPRestriction>;
  private accountBlocks: Map<string, IAccountBlock>;

  private constructor() {
    super();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.errorHandler = ErrorHandler;
    this.monitoringService = MonitoringService;
    this.rateLimitConfigs = new Map();
    this.abusePatterns = new Map();
    this.ipRestrictions = new Map();
    this.accountBlocks = new Map();

    // Initialize default rate limit configs
    this.initializeDefaultConfigs();

    // Load patterns from database
    this.loadAbusePatterns();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  private initializeDefaultConfigs(): void {
    // Default rate limit configs
    this.rateLimitConfigs.set('api', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      blockDuration: 60 * 60 * 1000, // 1 hour
    });

    this.rateLimitConfigs.set('auth', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5,
      blockDuration: 24 * 60 * 60 * 1000, // 24 hours
    });

    this.rateLimitConfigs.set('content', {
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      maxRequests: 50,
      blockDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private async loadAbusePatterns(): Promise<void> {
    try {
      // Load patterns from database
      const patterns = await this.redis.get('abuse:patterns');
      if (patterns) {
        const parsedPatterns = JSON.parse(patterns);
        for (const pattern of parsedPatterns) {
          this.abusePatterns.set(pattern.id, {
            ...pattern,
            pattern: new RegExp(pattern.pattern),
          });
        }
      }

      // Add default patterns if none exist
      if (this.abusePatterns.size === 0) {
        this.addAbusePattern({
          name: 'SQL Injection',
          pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|WHERE)\b)|(['"])/i,
          severity: 3,
          action: 'block',
          description: 'Detects potential SQL injection attempts',
        });

        this.addAbusePattern({
          name: 'XSS Attack',
          pattern: /<script[^>]*>.*?<\/script>|<[^>]*on\w+\s*=/i,
          severity: 3,
          action: 'block',
          description: 'Detects potential XSS attack attempts',
        });

        this.addAbusePattern({
          name: 'Spam Content',
          pattern: /(viagra|casino|lottery|winner|prize|free money)/i,
          severity: 2,
          action: 'warn',
          description: 'Detects common spam content patterns',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load abuse patterns';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.HIGH,
        timestamp: new Date(),
        context: { error: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  // Rate limiting methods
  public async checkRateLimit(
    userId: string,
    ipAddress: string,
    endpoint: string
  ): Promise<boolean> {
    try {
      const config = this.rateLimitConfigs.get(endpoint) || this.rateLimitConfigs.get('api');
      if (!config) {
        return true; // No rate limit configured
      }

      const key = `ratelimit:${endpoint}:${userId}:${ipAddress}`;
      const now = Date.now();

      // Get current count
      const count = await this.redis.get(key);
      const currentCount = count ? Number.parseInt(count, 10) : 0;

      if (currentCount >= config.maxRequests) {
        // Rate limit exceeded
        this.emit(SecurityEvent.RATE_LIMIT_EXCEEDED, {
          userId,
          ipAddress,
          endpoint,
          timestamp: new Date(),
          count: currentCount,
          limit: config.maxRequests,
        });

        // Log security audit
        this.logSecurityAudit({
          userId,
          action: 'rate_limit_exceeded',
          resource: endpoint,
          resourceId: '',
          ipAddress,
          userAgent: '',
          timestamp: new Date(),
          details: {
            count: currentCount,
            limit: config.maxRequests,
            windowMs: config.windowMs,
          },
        });

        return false;
      }

      // Increment count
      if (currentCount === 0) {
        // First request, set expiry
        await this.redis.setex(key, Math.floor(config.windowMs / 1000), '1');
      } else {
        await this.redis.incr(key);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Rate limit check failed';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
        context: {
          userId,
          ipAddress,
          endpoint,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      // In case of error, allow the request to proceed
      return true;
    }
  }

  public setRateLimitConfig(endpoint: string, config: IRateLimitConfig): void {
    this.rateLimitConfigs.set(endpoint, config);
    this.emit(SecurityEvent.PATTERN_UPDATED, {
      type: 'rate_limit',
      endpoint,
      config,
      timestamp: new Date(),
    });
  }

  // Abuse detection methods
  public async checkForAbuse(userId: string, content: string): Promise<boolean> {
    try {
      for (const pattern of this.abusePatterns.values()) {
        if (pattern.pattern.test(content)) {
          const audit: ISecurityAudit = {
            userId,
            action: 'abuse_detected',
            resource: 'content',
            resourceId: uuidv4(),
            ipAddress: '', // TODO: Get from request context
            userAgent: '', // TODO: Get from request context
            timestamp: new Date(),
            details: {
              patternId: pattern.id,
              patternName: pattern.name,
              severity: pattern.severity,
              action: pattern.action,
            },
          };

          await this.logSecurityAudit(audit);

          if (pattern.action === 'block') {
            await this.blockAccount(userId, `Abuse pattern detected: ${pattern.name}`);
          } else if (pattern.action === 'ban') {
            // TODO: Implement ban action
            const error = new Error(`User ${userId} banned for abuse pattern: ${pattern.name}`);
            this.errorHandler.handleError(error, {
              category: ErrorCategory.SECURITY,
              severity: ErrorSeverity.HIGH,
              userId,
              timestamp: new Date(),
              context: {
                patternId: pattern.id,
                patternName: pattern.name,
                action: 'ban',
              },
            });
          }

          return true;
        }
      }
      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error in abuse detection';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.HIGH,
        userId,
        timestamp: new Date(),
        context: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return false;
    }
  }

  public addAbusePattern(pattern: Omit<IAbusePattern, 'id' | 'createdAt' | 'updatedAt'>): void {
    try {
      const id = uuidv4();
      const now = new Date();

      const newPattern: IAbusePattern = {
        ...pattern,
        id,
        createdAt: now,
        updatedAt: now,
      };

      this.abusePatterns.set(id, newPattern);

      // Save to Redis
      const patterns = Array.from(this.abusePatterns.values()).map((p) => ({
        ...p,
        pattern: p.pattern.toString(),
      }));
      this.redis.set('abuse:patterns', JSON.stringify(patterns));

      this.emit(SecurityEvent.PATTERN_UPDATED, {
        type: 'abuse_pattern',
        pattern: newPattern,
        timestamp: now,
      });

      // Log security audit
      this.logSecurityAudit({
        userId: 'system',
        action: 'pattern_added',
        resource: 'abuse_pattern',
        resourceId: id,
        ipAddress: '',
        userAgent: '',
        timestamp: now,
        details: {
          patternName: pattern.name,
          severity: pattern.severity,
          action: pattern.action,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add abuse pattern';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
        context: {
          pattern: pattern.name,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  public removeAbusePattern(patternId: string): void {
    try {
      const pattern = this.abusePatterns.get(patternId);
      if (!pattern) {
        return;
      }

      this.abusePatterns.delete(patternId);

      // Save to Redis
      const patterns = Array.from(this.abusePatterns.values()).map((p) => ({
        ...p,
        pattern: p.pattern.toString(),
      }));
      this.redis.set('abuse:patterns', JSON.stringify(patterns));

      this.emit(SecurityEvent.PATTERN_UPDATED, {
        type: 'abuse_pattern_removed',
        patternId,
        timestamp: new Date(),
      });

      // Log security audit
      this.logSecurityAudit({
        userId: 'system',
        action: 'pattern_removed',
        resource: 'abuse_pattern',
        resourceId: patternId,
        ipAddress: '',
        userAgent: '',
        timestamp: new Date(),
        details: {
          patternName: pattern.name,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove abuse pattern';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
        context: {
          patternId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  public getAbusePatterns(): IAbusePattern[] {
    return Array.from(this.abusePatterns.values());
  }

  // Account blocking methods
  public isAccountBlocked(userId: string): boolean {
    try {
      const block = this.accountBlocks.get(userId);
      if (!block) {
        return false;
      }

      // Check if block is still active
      if (block.blockedUntil > new Date()) {
        return true;
      }
      // Block expired, remove it
      this.accountBlocks.delete(userId);
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Account block check failed';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
        context: {
          userId,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      return false;
    }
  }

  public blockAccount(
    userId: string,
    reason: string,
    durationMs: number = 24 * 60 * 60 * 1000
  ): void {
    try {
      const now = new Date();
      const blockedUntil = new Date(now.getTime() + durationMs);

      const block: IAccountBlock = {
        userId,
        reason,
        blockedUntil,
        createdAt: now,
        updatedAt: now,
      };

      this.accountBlocks.set(userId, block);

      this.emit(SecurityEvent.ACCOUNT_BLOCKED, {
        userId,
        reason,
        blockedUntil,
        timestamp: now,
      });

      // Log security audit
      this.logSecurityAudit({
        userId: 'system',
        action: 'account_blocked',
        resource: 'account',
        resourceId: userId,
        ipAddress: '',
        userAgent: '',
        timestamp: now,
        details: {
          reason,
          blockedUntil,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to block account';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
        context: {
          userId,
          reason,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  public unblockAccount(userId: string): void {
    try {
      const block = this.accountBlocks.get(userId);
      if (!block) {
        return;
      }

      this.accountBlocks.delete(userId);

      this.emit(SecurityEvent.RESTRICTION_REMOVED, {
        type: 'account_block',
        userId,
        timestamp: new Date(),
      });

      // Log security audit
      this.logSecurityAudit({
        userId: 'system',
        action: 'account_unblocked',
        resource: 'account',
        resourceId: userId,
        ipAddress: '',
        userAgent: '',
        timestamp: new Date(),
        details: {
          previousBlock: {
            reason: block.reason,
            blockedUntil: block.blockedUntil,
          },
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unblock account';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
        context: {
          userId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  // IP restriction methods
  public isIPRestricted(ipAddress: string): boolean {
    try {
      const restriction = this.ipRestrictions.get(ipAddress);
      if (!restriction) {
        return false;
      }

      // Check if restriction is still active
      if (restriction.blockedUntil > new Date()) {
        return true;
      }
      // Restriction expired, remove it
      this.ipRestrictions.delete(ipAddress);
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'IP restriction check failed';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
        context: {
          ipAddress,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      return false;
    }
  }

  public restrictIP(
    ipAddress: string,
    reason: string,
    durationMs: number = 24 * 60 * 60 * 1000
  ): void {
    try {
      const now = new Date();
      const blockedUntil = new Date(now.getTime() + durationMs);

      const restriction: IIPRestriction = {
        ipAddress,
        reason,
        blockedUntil,
        createdAt: now,
        updatedAt: now,
      };

      this.ipRestrictions.set(ipAddress, restriction);

      this.emit(SecurityEvent.IP_BLOCKED, {
        ipAddress,
        reason,
        blockedUntil,
        timestamp: now,
      });

      // Log security audit
      this.logSecurityAudit({
        userId: 'system',
        action: 'ip_restricted',
        resource: 'ip',
        resourceId: ipAddress,
        ipAddress,
        userAgent: '',
        timestamp: now,
        details: {
          reason,
          blockedUntil,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to restrict IP';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
        context: {
          ipAddress,
          reason,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  public unrestrictIP(ipAddress: string): void {
    try {
      const restriction = this.ipRestrictions.get(ipAddress);
      if (!restriction) {
        return;
      }

      this.ipRestrictions.delete(ipAddress);

      this.emit(SecurityEvent.RESTRICTION_REMOVED, {
        type: 'ip_restriction',
        ipAddress,
        timestamp: new Date(),
      });

      // Log security audit
      this.logSecurityAudit({
        userId: 'system',
        action: 'ip_unrestricted',
        resource: 'ip',
        resourceId: ipAddress,
        ipAddress,
        userAgent: '',
        timestamp: new Date(),
        details: {
          previousRestriction: {
            reason: restriction.reason,
            blockedUntil: restriction.blockedUntil,
          },
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unrestrict IP';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
        context: {
          ipAddress,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  // Audit methods
  public async logSecurityAudit(audit: ISecurityAudit): Promise<void> {
    try {
      // Store in Redis with expiration
      const key = `security:audit:${audit.userId}:${Date.now()}`;
      await this.redis.setex(key, 30 * 24 * 60 * 60, JSON.stringify(audit)); // 30 days retention

      // Emit event for real-time monitoring
      this.emit(SecurityEvent.SECURITY_AUDIT, audit);

      // Update monitoring metrics
      this.monitoringService.updateHealthCheck('security', {
        name: 'security',
        status: HealthStatus.HEALTHY,
        message: `Security audit logged: ${audit.action}`,
        timestamp: new Date(),
        details: {
          action: audit.action,
          resource: audit.resource,
          userId: audit.userId,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to log security audit';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
        context: {
          audit,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  public async getSecurityAudits(
    userId?: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<ISecurityAudit[]> {
    try {
      const audits: ISecurityAudit[] = [];
      const pattern = userId ? `security:audit:${userId}:*` : 'security:audit:*';
      const keys = await this.redis.keys(pattern);

      for (const key of keys) {
        const audit = await this.redis.get(key);
        if (audit) {
          const parsedAudit: ISecurityAudit = JSON.parse(audit);
          if (
            (!startTime || parsedAudit.timestamp >= startTime) &&
            (!endTime || parsedAudit.timestamp <= endTime)
          ) {
            audits.push(parsedAudit);
          }
        }
      }

      return audits.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get security audits';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
        context: {
          userId,
          startTime,
          endTime,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      return [];
    }
  }

  private getSeverityFromAction(action: string): ErrorSeverity {
    switch (action) {
      case 'rate_limit_exceeded':
        return ErrorSeverity.LOW;
      case 'abuse_detected':
        return ErrorSeverity.MEDIUM;
      case 'account_blocked':
      case 'ip_blocked':
        return ErrorSeverity.HIGH;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  // Utility methods
  public getRateLimitConfigs(): Map<string, IRateLimitConfig> {
    return new Map(this.rateLimitConfigs);
  }
}

export default SecurityService.getInstance();
