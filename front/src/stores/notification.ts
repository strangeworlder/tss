import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { INotification, INotificationPreferences } from '@/types/notification';
import { NotificationTypeEnum } from '@/services/NotificationService';
import { useNotificationService } from '@/services/NotificationService';
import type { IScheduledContent } from '@/types/scheduledContent';
import { useAuthStore } from './authStore';

export type NotificationStore = ReturnType<typeof useNotificationStore>;

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<INotification[]>([]);
  const preferences = ref<INotificationPreferences>({
    email: true,
    push: true,
    inApp: true,
    types: Object.values(NotificationTypeEnum).reduce(
      (acc, type) => {
        acc[type] = true;
        return acc;
      },
      {} as { [key in NotificationTypeEnum]: boolean }
    ),
  });

  const notificationService = useNotificationService();
  const authStore = useAuthStore();

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length);

  // Load initial state
  const loadNotifications = async (): Promise<void> => {
    const storedNotifications = await notificationService.getNotifications();
    notifications.value = storedNotifications;
  };

  const loadPreferences = async (): Promise<void> => {
    const storedPreferences = await notificationService.getPreferences();
    preferences.value = storedPreferences;
  };

  // Notification actions
  const removeNotification = async (id: string): Promise<void> => {
    await notificationService.deleteNotification(id);
    await loadNotifications();
  };

  const markAsRead = async (id: string): Promise<void> => {
    await notificationService.markAsRead(id);
    await loadNotifications();
  };

  // Add the notification methods to match what's used in the app
  const addNotification = async (payload: { type: string; message: string }): Promise<void> => {
    // Create a system error notification
    await notificationService.notifySystemError(payload.message);
    // Reload notifications to reflect the new one
    await loadNotifications();
  };

  // Add success, warning, error, and info methods
  const success = async (message: string): Promise<void> => {
    await notificationService.notifySystemSuccess(message);
    await loadNotifications();
  };

  const error = async (message: string): Promise<void> => {
    await notificationService.notifySystemError(message);
    await loadNotifications();
  };

  const warning = async (message: string): Promise<void> => {
    await notificationService.notifySystemWarning(message);
    await loadNotifications();
  };

  const info = async (message: string): Promise<void> => {
    await notificationService.notifySystemInfo(message);
    await loadNotifications();
  };

  // Preference actions
  const updatePreferences = async (
    newPreferences: Partial<INotificationPreferences>
  ): Promise<void> => {
    await notificationService.updatePreferences(newPreferences);
    await loadPreferences();
  };

  // Helper methods for common notification types
  const notifyContentScheduled = async (
    contentId: string,
    contentType: 'post' | 'comment',
    publishAt: Date
  ): Promise<void> => {
    const scheduledContent: IScheduledContent = {
      id: contentId,
      type: contentType,
      content: contentId, // Using contentId as content since we don't have the actual content
      publishAt,
      status: 'scheduled',
      authorId: authStore.user?.id || '',
      version: 1,
      hasActiveUpdate: false,
    };
    await notificationService.notifyContentScheduled(scheduledContent);
    await loadNotifications();
  };

  const notifyContentPublished = async (
    contentId: string,
    contentType: 'post' | 'comment'
  ): Promise<void> => {
    const scheduledContent: IScheduledContent = {
      id: contentId,
      type: contentType,
      content: contentId, // Using contentId as content since we don't have the actual content
      publishAt: new Date(),
      status: 'published',
      authorId: authStore.user?.id || '',
      version: 1,
      hasActiveUpdate: false,
    };
    await notificationService.notifyContentPublished(scheduledContent);
    await loadNotifications();
  };

  const notifyPublicationFailed = async (
    contentId: string,
    contentType: 'post' | 'comment',
    error: string
  ): Promise<void> => {
    const scheduledContent: IScheduledContent = {
      id: contentId,
      type: contentType,
      content: contentId, // Using contentId as content since we don't have the actual content
      publishAt: new Date(),
      status: 'failed',
      authorId: authStore.user?.id || '',
      version: 1,
      hasActiveUpdate: false,
      error,
    };
    await notificationService.notifyContentFailed(scheduledContent, error);
    await loadNotifications();
  };

  // After the existing success, error, warning, and info methods
  // Add alias methods for backward compatibility
  const showSuccess = success;
  const showError = error;
  const showWarning = warning;
  const showInfo = info;

  return {
    notifications,
    preferences,
    unreadCount,
    loadNotifications,
    loadPreferences,
    removeNotification,
    markAsRead,
    updatePreferences,
    notifyContentScheduled,
    notifyContentPublished,
    notifyPublicationFailed,
    addNotification,
    // Existing methods
    success,
    error,
    warning,
    info,
    // Alias methods for backward compatibility
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
});
