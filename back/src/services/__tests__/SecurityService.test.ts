import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  SecurityService,
  SecurityEvent,
  type IRateLimitConfig,
  type IAbusePattern,
} from '../SecurityService';
import ErrorHandler from '../ErrorHandler';
import MonitoringService from '../MonitoringService';

// Mock Redis
vi.mock('ioredis', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn(),
      setex: vi.fn(),
      incr: vi.fn(),
    })),
  };
});

// Mock ErrorHandler
vi.mock('../ErrorHandler', () => {
  return {
    default: {
      handleError: vi.fn(),
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
vi.mock('../MonitoringService', () => {
  return {
    default: {
      updateSecurityMetrics: vi.fn(),
    },
  };
});

describe('SecurityService', () => {
  let securityService: SecurityService;

  beforeEach(() => {
    // Reset the singleton instance for each test
    (SecurityService as any).instance = null;
    securityService = SecurityService.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      // Mock Redis get to return a count below the limit
      const redis = (securityService as any).redis;
      redis.get.mockResolvedValue('5');

      const result = await securityService.checkRateLimit('user123', '192.168.1.1', 'api');

      expect(result).toBe(true);
      expect(redis.get).toHaveBeenCalled();
      expect(redis.incr).toHaveBeenCalled();
    });

    it('should block requests exceeding rate limit', async () => {
      // Mock Redis get to return a count above the limit
      const redis = (securityService as any).redis;
      redis.get.mockResolvedValue('150');

      const result = await securityService.checkRateLimit('user123', '192.168.1.1', 'api');

      expect(result).toBe(false);
      expect(redis.get).toHaveBeenCalled();
      expect(redis.incr).not.toHaveBeenCalled();
    });

    it('should emit rate limit exceeded event', async () => {
      // Mock Redis get to return a count above the limit
      const redis = (securityService as any).redis;
      redis.get.mockResolvedValue('150');

      const eventSpy = vi.fn();
      securityService.on(SecurityEvent.RATE_LIMIT_EXCEEDED, eventSpy);

      await securityService.checkRateLimit('user123', '192.168.1.1', 'api');

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          ipAddress: '192.168.1.1',
          endpoint: 'api',
          count: 150,
          limit: 100,
        })
      );
    });

    it('should set rate limit config', () => {
      const config: IRateLimitConfig = {
        windowMs: 30 * 60 * 1000, // 30 minutes
        maxRequests: 200,
        blockDuration: 2 * 60 * 60 * 1000, // 2 hours
      };

      const eventSpy = vi.fn();
      securityService.on(SecurityEvent.PATTERN_UPDATED, eventSpy);

      securityService.setRateLimitConfig('custom', config);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rate_limit',
          endpoint: 'custom',
          config,
        })
      );
    });
  });

  describe('Abuse Detection', () => {
    it('should detect abuse patterns in content', async () => {
      const eventSpy = vi.fn();
      securityService.on(SecurityEvent.ABUSE_DETECTED, eventSpy);

      const result = await securityService.checkForAbuse(
        'user123',
        '<script>alert("xss")</script>'
      );

      expect(result).toBe(true);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          action: 'abuse_detected',
          resource: 'content',
        })
      );
    });

    it('should not detect abuse in clean content', async () => {
      const eventSpy = vi.fn();
      securityService.on(SecurityEvent.ABUSE_DETECTED, eventSpy);

      const result = await securityService.checkForAbuse('user123', 'This is a normal comment');

      expect(result).toBe(false);
      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should add abuse pattern', () => {
      const pattern: Omit<IAbusePattern, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Pattern',
        description: 'Test description',
        pattern: /test/i,
        severity: 2,
        action: 'warn',
      };

      const eventSpy = vi.fn();
      securityService.on(SecurityEvent.PATTERN_UPDATED, eventSpy);

      securityService.addAbusePattern(pattern);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'abuse_pattern',
          pattern: expect.objectContaining({
            name: 'Test Pattern',
          }),
        })
      );
    });

    it('should remove abuse pattern', () => {
      // First add a pattern
      const pattern: Omit<IAbusePattern, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Pattern',
        description: 'Test description',
        pattern: /test/i,
        severity: 2,
        action: 'warn',
      };

      securityService.addAbusePattern(pattern);
      const patterns = securityService.getAbusePatterns();
      const patternId = patterns[0].id;

      const eventSpy = vi.fn();
      securityService.on(SecurityEvent.PATTERN_UPDATED, eventSpy);

      securityService.removeAbusePattern(patternId);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'abuse_pattern_removed',
          patternId,
        })
      );
    });
  });

  describe('IP Restrictions', () => {
    it('should restrict IP address', () => {
      const eventSpy = vi.fn();
      securityService.on(SecurityEvent.IP_BLOCKED, eventSpy);

      securityService.restrictIP('192.168.1.1', 'Suspicious activity', 60 * 60 * 1000); // 1 hour

      expect(securityService.isIPRestricted('192.168.1.1')).toBe(true);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '192.168.1.1',
          reason: 'Suspicious activity',
        })
      );
    });

    it('should remove IP restriction', () => {
      // First restrict an IP
      securityService.restrictIP('192.168.1.1', 'Suspicious activity', 60 * 60 * 1000); // 1 hour

      const eventSpy = vi.fn();
      securityService.on(SecurityEvent.RESTRICTION_REMOVED, eventSpy);

      securityService.unrestrictIP('192.168.1.1');

      expect(securityService.isIPRestricted('192.168.1.1')).toBe(false);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ip_restriction',
          ipAddress: '192.168.1.1',
        })
      );
    });
  });

  describe('Account Blocking', () => {
    it('should block account', () => {
      const eventSpy = vi.fn();
      securityService.on(SecurityEvent.ACCOUNT_BLOCKED, eventSpy);

      securityService.blockAccount('user123', 'Violation of terms', 24 * 60 * 60 * 1000); // 24 hours

      expect(securityService.isAccountBlocked('user123')).toBe(true);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          reason: 'Violation of terms',
        })
      );
    });

    it('should unblock account', () => {
      // First block an account
      securityService.blockAccount('user123', 'Violation of terms', 24 * 60 * 60 * 1000); // 24 hours

      const eventSpy = vi.fn();
      securityService.on(SecurityEvent.RESTRICTION_REMOVED, eventSpy);

      const result = securityService.unblockAccount('user123');

      expect(result).toBe(true);
      expect(securityService.isAccountBlocked('user123')).toBe(false);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'account',
          userId: 'user123',
        })
      );
    });
  });

  describe('Security Audit', () => {
    it('should log security audit', () => {
      const eventSpy = vi.fn();
      securityService.on(SecurityEvent.SECURITY_AUDIT, eventSpy);

      const auditId = securityService.logSecurityAudit({
        userId: 'user123',
        action: 'login_attempt',
        resource: 'auth',
        resourceId: 'login',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(),
        details: { success: true },
      });

      expect(auditId).toBeDefined();
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          action: 'login_attempt',
          resource: 'auth',
        })
      );
    });
  });

  describe('Utility Methods', () => {
    it('should get abuse patterns', () => {
      const patterns = securityService.getAbusePatterns();

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0]).toHaveProperty('id');
      expect(patterns[0]).toHaveProperty('name');
      expect(patterns[0]).toHaveProperty('pattern');
    });

    it('should get rate limit configs', () => {
      const configs = securityService.getRateLimitConfigs();

      expect(configs.size).toBeGreaterThan(0);
      expect(configs.has('api')).toBe(true);
      expect(configs.has('auth')).toBe(true);
      expect(configs.has('content')).toBe(true);
    });
  });
});
