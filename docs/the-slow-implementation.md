# The Slow Feature Implementation Plan

## Overview
"The Slow" is a feature that introduces a 24-hour delay for blog posts and comments before they become visible on the site. This document outlines the implementation plan for this feature.

## Behavior Specifications

### Content Scheduling
1. **Post Creation**
   - When a user creates a post, it enters a 24-hour scheduling period
   - During this period, only the author can see and edit the post
   - The post shows a preview state with a countdown timer
   - The author can cancel or reschedule the publication
   - The post automatically publishes after 24 hours

2. **Comment Creation**
   - Comments follow the same 24-hour scheduling rule as posts
   - Only the comment author can see their scheduled comments
   - Comments show a preview state with a countdown timer
   - Authors can cancel or reschedule their comments
   - Comments automatically publish after 24 hours

3. **Content Updates**
   - When a published post/comment is edited:
     - The current version remains visible on the site
     - The author sees their edited version in a preview state
     - The edited version has its own 24-hour timer
     - The author can continue editing the preview version (resetting its timer)
     - The edited version automatically replaces the current version after 24 hours
   - Previous versions are preserved for audit purposes
   - The preview updates immediately to reflect changes

4. **Admin Controls**
   - Administrators can modify the global scheduling delay
   - Changes to the global delay affect all new content
   - Existing scheduled content maintains its original delay
   - Admin changes are logged and audited
   - Admin can override individual content delays for debugging

### Visibility Rules
1. **Author View**
   - Authors see their scheduled content in a "Scheduled" tab
   - Authors can preview how their content will appear
   - Authors can edit, cancel, or reschedule their content
   - Authors see the exact time their content will publish
   - Authors can see both current and pending versions of their content

2. **Public View**
   - Scheduled content is not visible to other users
   - Once published, content appears in normal chronological order
   - No indication of the scheduling period is shown after publication
   - Users always see the most recently published version of content

### User Experience
1. **Notifications**
   - Authors receive notifications when:
     - Their content is scheduled
     - The scheduling timer resets due to edits
     - Their content is about to publish (5 minutes before)
     - Their content has been published
     - Their content publication fails

2. **Timer Display**
   - Shows remaining time in a user-friendly format
   - Updates in real-time
   - Pauses when the user is offline
   - Resumes and syncs when back online

3. **Error Handling**
   - Failed publications are retried automatically
   - Authors are notified of publication failures
   - Authors can manually trigger publication after failures
   - System maintains a log of all publication attempts

### Performance Requirements
1. **Timer Accuracy**
   - Timer should be accurate to within 1 second
   - Timer should handle timezone changes correctly
   - Timer should maintain accuracy during page refreshes

2. **Offline Support**
   - Content can be scheduled while offline
   - Timer continues to count down offline
   - Changes sync when back online
   - Publication attempts queue for when online

3. **Resource Usage**
   - Timer updates should be efficient
   - Batch processing for multiple scheduled items
   - Cache frequently accessed scheduled content
   - Minimize database queries for timer updates

### Security Requirements
1. **Access Control**
   - Only authors can view their scheduled content
   - Only authors can edit their scheduled content
   - Only authors can cancel or reschedule their content
   - System logs all scheduling-related actions
   - Two-factor authentication for admin actions
   - JWE-based tokens for sensitive operations

2. **Data Protection**
   - Scheduled content is encrypted at rest
   - Preview data is properly sanitized
   - Version history is maintained securely
   - Audit logs are tamper-proof
   - Field-level encryption for sensitive content
   - Secure key rotation for encryption keys

3. **Abuse Prevention**
   - Rate limiting for all operations
   - Pattern detection for abuse attempts
   - Automatic blocking of suspicious accounts
   - Content moderation for scheduled content
   - IP-based restrictions for suspicious activity

## Database Changes

### Blog Post Model Updates
1. Add new fields to `BlogPostModel`:
   ```typescript
   publishAt: { type: Date, default: null, index: true },
   status: { 
     type: String, 
     enum: ['draft', 'scheduled', 'published', 'pending_update'],
     default: 'draft'
   },
   timezone: { type: String, default: 'UTC' },
   version: { type: Number, default: 1 },
   pendingUpdateId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', default: null },
   hasActiveUpdate: { type: Boolean, default: false },
   originalPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', default: null },
   content: { 
     type: String, 
     encrypted: true,
     encryptionKey: process.env.CONTENT_ENCRYPTION_KEY 
   },
   moderationStatus: {
     type: String,
     enum: ['pending', 'approved', 'rejected', 'flagged'],
     default: 'pending'
   },
   abuseScore: { type: Number, default: 0 },
   lastModeratedAt: { type: Date, default: null }
   ```

### Comment Model Updates
1. Add new fields to `CommentModel`:
   ```typescript
   publishAt: { type: Date, default: null, index: true },
   status: { 
     type: String, 
     enum: ['draft', 'scheduled', 'published', 'pending_update'],
     default: 'draft'
   },
   timezone: { type: String, default: 'UTC' },
   version: { type: Number, default: 1 },
   replyDepth: { type: Number, default: 0 },
   pendingUpdateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
   hasActiveUpdate: { type: Boolean, default: false },
   originalCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
   content: { 
     type: String, 
     encrypted: true,
     encryptionKey: process.env.CONTENT_ENCRYPTION_KEY 
   },
   moderationStatus: {
     type: String,
     enum: ['pending', 'approved', 'rejected', 'flagged'],
     default: 'pending'
   },
   abuseScore: { type: Number, default: 0 },
   lastModeratedAt: { type: Date, default: null }
   ```

### Configuration Model
1. Create a new configuration model for admin settings:
   ```typescript
   const ConfigurationSchema = new mongoose.Schema({
     key: { type: String, required: true, unique: true },
     value: { type: mongoose.Schema.Types.Mixed, required: true },
     description: { type: String },
     updatedAt: { type: Date, default: Date.now },
     updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     requiresVerification: { type: Boolean, default: false },
     lastVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     lastVerifiedAt: { type: Date, default: null },
     verificationMethod: { 
       type: String, 
       enum: ['2fa', 'admin_approval', 'none'],
       default: 'none'
     }
   });

   // Default configurations
   const defaultConfigs = [
     {
       key: 'slow_feature_delay',
       value: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
       description: 'Global delay for The Slow feature in milliseconds',
       requiresVerification: true,
       verificationMethod: '2fa'
     }
   ];
   ```

### Security Models
1. Create models for security-related data:
   ```typescript
   // Rate limiting
   const RateLimitSchema = new mongoose.Schema({
     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     action: { type: String, required: true },
     count: { type: Number, default: 0 },
     lastReset: { type: Date, default: Date.now },
     blockedUntil: { type: Date, default: null }
   });

   // Abuse detection
   const AbusePatternSchema = new mongoose.Schema({
     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     pattern: { type: String, required: true },
     severity: { type: Number, required: true },
     detectedAt: { type: Date, default: Date.now },
     resolvedAt: { type: Date, default: null },
     action: { type: String, enum: ['warn', 'block', 'ban'], default: 'warn' }
   });

   // Security audit
   const SecurityAuditSchema = new mongoose.Schema({
     action: { type: String, required: true },
     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     ip: { type: String },
     userAgent: { type: String },
     details: { type: mongoose.Schema.Types.Mixed },
     timestamp: { type: Date, default: Date.now },
     verified: { type: Boolean, default: false }
   });
   ```

## Backend Implementation

### 1. Core Services

#### SchedulingService
```typescript
interface ISchedulingService {
  scheduleContent(contentId: string, type: 'post' | 'comment'): Promise<void>;
  cancelScheduling(contentId: string): Promise<void>;
  rescheduleContent(contentId: string, newPublishAt: Date): Promise<void>;
  getScheduledContent(): Promise<IScheduledContent[]>;
  getGlobalDelaySettings(): Promise<number>;
  getCurrentDelay(contentId: string): Promise<number>;
  createPendingUpdate(contentId: string, type: 'post' | 'comment', updateData: any): Promise<string>;
}
```

#### PublicationService
```typescript
interface IPublicationService {
  publishContent(contentId: string): Promise<void>;
  publishUpdate(originalId: string, updateId: string): Promise<void>;
  handleFailedPublication(contentId: string, error: Error): Promise<void>;
  retryFailedPublications(): Promise<void>;
}
```

#### ConfigurationService
```typescript
interface IConfigurationService {
  getGlobalDelay(): Promise<number>;
  setGlobalDelay(delayMs: number, userId: string): Promise<void>;
  overrideContentDelay(contentId: string, delayMs: number, userId: string): Promise<void>;
  getContentOverrides(): Promise<Map<string, number>>;
  resetContentOverride(contentId: string): Promise<void>;
  getConfigurationHistory(key: string): Promise<IConfigChange[]>;
}
```

#### CacheService
```typescript
interface ICacheService {
  cacheScheduledContent(content: IScheduledContent): Promise<void>;
  getCachedScheduledContent(): Promise<IScheduledContent[]>;
  invalidateCache(contentId: string): Promise<void>;
  cachePendingUpdates(userId: string, updates: IPendingUpdate[]): Promise<void>;
  getPendingUpdates(userId: string): Promise<IPendingUpdate[]>;
}
```

#### ErrorHandler
```typescript
interface IErrorHandler {
  handlePublicationError(error: Error, contentId: string): Promise<void>;
  retryFailedOperation(operation: string, contentId: string): Promise<void>;
  logError(error: Error, context: any): Promise<void>;
}
```

#### MonitoringService
```typescript
interface IMonitoringService {
  trackScheduledContent(): Promise<void>;
  trackPendingUpdates(): Promise<void>;
  alertOnPublicationFailure(error: Error): Promise<void>;
  generateMetrics(): Promise<IMetrics>;
}
```

#### Security Services
```typescript
interface ISecurityService {
  // Rate limiting
  getRateLimit(userId: string, action: string): Promise<RateLimit>;
  incrementUsage(userId: string, action: string): Promise<void>;
  isRateLimited(userId: string, action: string): Promise<boolean>;
  
  // Abuse prevention
  detectAbusePatterns(userId: string): Promise<AbusePatterns>;
  applyPenalty(userId: string, pattern: AbusePattern): Promise<void>;
  isRestricted(userId: string, action: string): Promise<boolean>;
  
  // Audit
  logSecurityEvent(event: SecurityEvent): Promise<void>;
  getSecurityAuditLogs(filters: AuditFilters): Promise<SecurityAudit[]>;
  verifySecurityEvent(eventId: string): Promise<boolean>;
}

interface IEncryptionService {
  encryptContent(content: string): Promise<string>;
  decryptContent(encryptedContent: string): Promise<string>;
  rotateEncryptionKeys(): Promise<void>;
  getCurrentKeyVersion(): Promise<string>;
}

interface IAuthenticationService {
  verifyAdminAction(userId: string, verificationCode: string): Promise<boolean>;
  generateJWE(payload: any): Promise<string>;
  verifyJWE(token: string): Promise<any>;
  rotateTokens(): Promise<void>;
}
```

#### Transaction Service
```typescript
interface ITransactionService {
  startTransaction(): Promise<Transaction>;
  commitTransaction(transaction: Transaction): Promise<void>;
  rollbackTransaction(transaction: Transaction): Promise<void>;
  executeInTransaction<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T>;
}
```

#### Circuit Breaker
```typescript
class CircuitBreaker {
  private failures: number = 0;
  private lastFailure: Date | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Implement circuit breaker pattern
  }
}
```

#### Version Control Service
```typescript
interface IVersionControlService {
  createVersion(contentId: string, data: any): Promise<string>;
  getVersionHistory(contentId: string): Promise<Version[]>;
  diffVersions(versionId1: string, versionId2: string): Promise<Diff>;
  restoreVersion(contentId: string, versionId: string): Promise<void>;
}
```

#### Distributed Lock Service
```typescript
interface IDistributedLockService {
  acquireLock(resource: string, ttl: number): Promise<string>;
  releaseLock(resource: string, lockId: string): Promise<boolean>;
  extendLock(resource: string, lockId: string, ttl: number): Promise<boolean>;
  executeLocked<T>(resource: string, fn: () => Promise<T>, ttl: number): Promise<T>;
}
```

#### Content Moderation Service
```typescript
interface IContentModerationService {
  scanContent(content: string): Promise<ModerationResult>;
  isSafe(content: string): Promise<boolean>;
  flagForReview(contentId: string, reason: string): Promise<void>;
  getModeratedContent(): Promise<ModeratedContent[]>;
  autoModerate(content: string): Promise<ModerationDecision>;
}
```

#### Dead Letter Service
```typescript
interface IDeadLetterService {
  moveToDeadLetter(operation: string, payload: any, error: Error): Promise<void>;
  retryDeadLetters(): Promise<void>;
  purgeOldDeadLetters(olderThan: Date): Promise<number>;
  getDeadLetterStats(): Promise<DeadLetterStats>;
}
```

#### Enhanced Monitoring Service
```typescript
interface IEnhancedMonitoringService extends IMonitoringService {
  monitorSecurityEvents(): Promise<void>;
  trackAnomalies(): Promise<void>;
  monitorSystemHealth(): Promise<void>;
  generateSecurityReport(): Promise<SecurityReport>;
  alertOnAbnormalBehavior(pattern: AnomalyPattern): Promise<void>;
  trackPerformanceMetrics(): Promise<PerformanceMetrics>;
}
```

### 2. Blog Post Controller Updates
1. Modify `createPost` endpoint:
   - Use `SchedulingService` to schedule content
   - Implement proper error handling
   - Cache the scheduled content

2. Modify `updatePost` endpoint:
   - Check if post is already published
   - If published, create a pending update with `SchedulingService.createPendingUpdate`
   - Set timer for the pending update
   - Return both current and pending versions

3. Add new endpoints:
   - `getScheduledPosts`: Fetch posts with caching
   - `getPendingUpdates`: Fetch pending updates for a post
   - `cancelScheduling`: Cancel scheduled publication
   - `cancelPendingUpdate`: Cancel a pending update
   - `previewPost`: Generate preview of scheduled content

### 3. Comment Controller Updates
1. Modify `createComment` endpoint:
   - Implement comment hierarchy validation
   - Use `SchedulingService` for scheduling
   - Cache the scheduled comment

2. Modify `updateComment` endpoint:
   - Check if comment is already published
   - If published, create a pending update
   - Set timer for the pending update
   - Return both current and pending versions

3. Add new endpoints:
   - `getScheduledComments`: Fetch comments with caching
   - `getPendingUpdates`: Fetch pending updates for a comment
   - `cancelScheduling`: Cancel scheduled publication
   - `cancelPendingUpdate`: Cancel a pending update
   - `previewComment`: Generate preview of scheduled content

### 4. Admin Controller
```typescript
class AdminController {
  // Get current global delay
  async getGlobalDelay(req: Request, res: Response): Promise<void> { }
  
  // Update global delay
  async updateGlobalDelay(req: Request, res: Response): Promise<void> { }
  
  // Get content delay overrides
  async getContentOverrides(req: Request, res: Response): Promise<void> { }
  
  // Override delay for specific content
  async overrideContentDelay(req: Request, res: Response): Promise<void> { }
  
  // Reset override for specific content
  async resetContentOverride(req: Request, res: Response): Promise<void> { }
  
  // Get configuration history
  async getConfigHistory(req: Request, res: Response): Promise<void> { }
}
```

### 5. Batch Processing Service
```typescript
class BatchProcessor {
  public async processScheduledContent(batchSize: number = 100): Promise<void> {
    // Process multiple scheduled items efficiently
  }
  
  public async processPendingUpdates(batchSize: number = 100): Promise<void> {
    // Process multiple pending updates efficiently
  }
}
```

## Frontend Implementation

### 1. Core Services

#### TimerService
```typescript
class TimerService {
  private static instance: TimerService;
  private timers: Map<string, NodeJS.Timer>;
  
  public startTimer(id: string, publishAt: Date, callback: () => void): void {
    // Implement efficient timer management
  }
  
  public async getContentDelay(contentId: string): Promise<number> {
    // Get content-specific delay (respecting admin overrides)
  }
}
```

#### ScheduledContentStore
```typescript
interface IScheduledContentStore {
  saveScheduledContent(content: IScheduledContent): Promise<void>;
  savePendingUpdate(originalId: string, updateContent: IPendingUpdate): Promise<void>;
  getScheduledContent(): Promise<IScheduledContent[]>;
  getPendingUpdates(): Promise<IPendingUpdate[]>;
  syncWithServer(): Promise<void>;
}
```

#### AdminService
```typescript
interface IAdminService {
  getGlobalDelay(): Promise<number>;
  updateGlobalDelay(delayMs: number): Promise<void>;
  getContentOverrides(): Promise<Map<string, number>>;
  overrideContentDelay(contentId: string, delayMs: number): Promise<void>;
  resetContentOverride(contentId: string): Promise<void>;
  getConfigHistory(): Promise<IConfigChange[]>;
}
```

#### FeatureFlagService
```typescript
interface IFeatureFlagService {
  isSlowFeatureEnabled(): boolean;
  isSlowFeatureEnabledForUser(userId: string): boolean;
}
```

### 2. Blog Post Components
1. Update `BlogPost.vue`:
   - Implement efficient timer updates
   - Add offline support
   - Add preview functionality
   - Handle feature flags
   - Show current and pending versions to authors

2. Create new components:
   - `ScheduledPostTimer.vue`: Efficient timer display
   - `ScheduledPostPreview.vue`: Preview functionality
   - `ScheduledPostStatus.vue`: Status display
   - `PendingUpdatePreview.vue`: Preview pending updates

### 3. Comment Components
1. Update `CommentList.vue`:
   - Add infinite reply nesting
   - Implement efficient timer updates
   - Add offline support
   - Handle feature flags
   - Show current and pending versions to authors

2. Create new components:
   - `ScheduledCommentTimer.vue`: Efficient timer display
   - `ScheduledCommentPreview.vue`: Preview functionality
   - `ScheduledCommentStatus.vue`: Status display
   - `PendingUpdatePreview.vue`: Preview pending updates

### 4. Admin Components
1. Create `AdminDelaySettings.vue`:
   - Display current global delay
   - Allow updating global delay
   - Show history of changes
   - Display active content overrides

2. Create `ContentDelayOverride.vue`:
   - Allow setting delay override for specific content
   - Display current override status
   - Show expiration of override

### 5. Store Updates
1. Update `blogStore`:
   - Add offline support
   - Implement efficient caching
   - Add version tracking
   - Handle feature flags
   - Add support for pending updates

2. Update `commentStore`:
   - Add offline support
   - Implement efficient caching
   - Add version tracking
   - Handle feature flags
   - Add support for pending updates

3. Create `adminStore`:
   - Store global delay settings
   - Track content overrides
   - Store configuration history

## API Updates

### 1. GraphQL Schema Updates
```graphql
type Mutation {
  scheduleContent(input: ScheduleContentInput!): ScheduleContentPayload!
  cancelScheduling(contentId: ID!): CancelSchedulingPayload!
  rescheduleContent(input: RescheduleContentInput!): RescheduleContentPayload!
  previewContent(contentId: ID!): PreviewContentPayload!
  createPendingUpdate(input: CreatePendingUpdateInput!): CreatePendingUpdatePayload!
  cancelPendingUpdate(updateId: ID!): CancelPendingUpdatePayload!
  setGlobalDelay(delayMs: Int!): SetGlobalDelayPayload!
  overrideContentDelay(input: OverrideContentDelayInput!): OverrideContentDelayPayload!
  resetContentOverride(contentId: ID!): ResetContentOverridePayload!
}

type Subscription {
  contentScheduled: ContentScheduledPayload!
  contentPublished: ContentPublishedPayload!
  pendingUpdateCreated: PendingUpdateCreatedPayload!
  pendingUpdatePublished: PendingUpdatePublishedPayload!
  globalDelayChanged: GlobalDelayChangedPayload!
}

type Content {
  id: ID!
  publishAt: String
  status: ContentStatus!
  timezone: String!
  version: Int!
  preview: String
  pendingUpdateId: ID
  hasActiveUpdate: Boolean!
  originalContentId: ID
}

enum ContentStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  PENDING_UPDATE
  REJECTED
}

type PendingUpdate {
  id: ID!
  originalContentId: ID!
  publishAt: String!
  status: ContentStatus!
  version: Int!
  preview: String
}

type GlobalDelaySetting {
  value: Int!
  updatedAt: String!
  updatedBy: User
}

type ContentOverride {
  contentId: ID!
  delayMs: Int!
  expiresAt: String
  setBy: User!
}
```

### 2. Webhook Support
```typescript
interface IWebhookService {
  registerWebhook(url: string, events: string[]): Promise<void>;
  notifyWebhooks(event: string, payload: any): Promise<void>;
}
```

## Testing Plan

### 1. Security Testing
1. Create comprehensive security tests:
   - Rate limiting tests
   - Authentication tests
   - Authorization tests
   - Encryption tests
   - Abuse prevention tests
   - Audit log tests

2. Add penetration testing:
   - API security testing
   - Frontend security testing
   - Authentication bypass testing
   - Rate limit bypass testing

### 2. Performance Testing
1. Create load tests:
   - Concurrent user simulation
   - Rate limit testing
   - Circuit breaker testing
   - Lock mechanism testing

2. Add stress tests:
   - High volume content creation
   - Multiple concurrent updates
   - System resource monitoring

## Deployment Checklist
1. Run database migrations
2. Deploy backend services
3. Deploy frontend changes
4. Enable feature flags
5. Monitor performance
6. Monitor error rates
7. Monitor security events
8. Gather user feedback
9. Plan for hotfixes if needed 