# The Slow Feature Documentation

## Overview

The Slow is a feature that introduces a configurable delay between content creation and publication. This feature is designed to encourage thoughtful content creation and reduce impulsive posting. It applies to all types of content, including:
- Posts
- Comments
- Comment replies

## Core Concepts

### Global Delay
- A system-wide delay setting that applies to all content by default
- Configurable by administrators
- Default value: 24 hours
- Stored in milliseconds for precise timing
- Applies uniformly to posts, comments, and replies

### Content Overrides
- Individual content items can have custom delay settings
- Overrides can be temporary or permanent
- Requires administrative privileges to set
- Can be used for special cases or exceptions
- Can be applied to specific posts, comments, or replies

### Timer System
- Handles countdown to publication
- Works both online and offline
- Supports timezone-aware scheduling
- Provides real-time updates on remaining time
- Manages timers for all content types (posts, comments, replies)

## Technical Implementation

### Frontend Components

1. **ScheduledPostTimer**
   - Displays countdown timer for scheduled content
   - Shows publication status
   - Handles offline mode
   - Provides visual feedback for different states
   - Used for both posts and comments

2. **AdminDelaySettings**
   - Manages global delay settings
   - Displays current delay configuration
   - Shows history of changes
   - Manages content overrides
   - Allows setting different delays for posts and comments

### Services

1. **TimerService**
   - Singleton service managing all content timers
   - Handles timer creation, updates, and completion
   - Supports offline functionality
   - Manages timezone differences
   - Processes timers for all content types

2. **BackgroundTimerService**
   - Runs in a separate thread for accurate timing
   - Ensures timers continue even when app is in background
   - Handles timer updates and completion events
   - Manages timers for posts, comments, and replies

3. **OfflineStorageService**
   - Stores timer data for offline use
   - Syncs with server when online
   - Maintains timer state during offline periods
   - Handles storage for all content types

### Backend Services

1. **ConfigurationService**
   - Manages global delay settings
   - Handles configuration changes
   - Requires verification for sensitive changes
   - Maintains configuration history
   - Supports separate delay settings for posts and comments

2. **SchedulingService**
   - Handles content scheduling
   - Manages publication timing
   - Sends notifications before publication
   - Handles timezone conversions
   - Processes scheduling for all content types

## API Endpoints

### Configuration
- `GET /api/v1/configuration/slow-feature-delay`
  - Returns current global delay settings for posts and comments
- `PUT /api/v1/configuration/slow-feature-delay`
  - Updates global delay settings
  - Can set different delays for posts and comments
  - Requires admin privileges
  - May require 2FA verification

### Content Scheduling
- `POST /api/v1/content/schedule`
  - Schedules content for delayed publication
  - Accepts content and desired publication time
  - Supports posts, comments, and replies
- `GET /api/v1/content/{id}/delay`
  - Returns delay information for specific content
  - Works for all content types
- `GET /api/v1/content/{id}/publish-date`
  - Returns scheduled publication date
  - Supports all content types

## Security Considerations

1. **Access Control**
   - Global delay changes require admin privileges
   - Content overrides require admin privileges
   - Sensitive changes may require 2FA verification
   - Applies uniformly across all content types

2. **Data Integrity**
   - Timer data is validated on both client and server
   - Offline changes are verified on reconnection
   - Timezone information is preserved
   - Consistent validation for all content types

## Error Handling

1. **Offline Mode**
   - Timers continue to count down
   - Changes are queued for sync
   - Publication is attempted when online
   - Applies to all content types

2. **Network Issues**
   - Retry mechanism for failed operations
   - Graceful degradation of features
   - Clear user feedback on status
   - Consistent handling across content types

## Best Practices

1. **Configuration**
   - Set reasonable default delays for both posts and comments
   - Document all configuration changes
   - Maintain configuration history
   - Use appropriate verification levels
   - Consider different delay settings for posts vs comments

2. **User Experience**
   - Provide clear feedback on publication timing
   - Show countdown timers prominently
   - Handle timezone differences transparently
   - Maintain consistent behavior across devices
   - Clearly indicate delayed status for all content types

3. **Performance**
   - Use background workers for timer processing
   - Optimize timer updates
   - Minimize network requests
   - Cache frequently accessed data
   - Handle multiple content types efficiently

## Monitoring

1. **Metrics**
   - Track timer accuracy for all content types
   - Monitor publication success rates
   - Log configuration changes
   - Track override usage
   - Separate metrics for posts and comments

2. **Health Checks**
   - Verify timer service status
   - Check configuration service health
   - Monitor offline storage capacity
   - Track sync queue status
   - Monitor performance across content types 