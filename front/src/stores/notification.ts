import { defineStore } from 'pinia';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: []
  }),

  getters: {
    getNotifications: (state) => state.notifications
  },

  actions: {
    addNotification(notification: Omit<Notification, 'id'>) {
      const id = Math.random().toString(36).substr(2, 9);
      this.notifications.push({ ...notification, id });

      if (notification.duration !== 0) {
        setTimeout(() => {
          this.removeNotification(id);
        }, notification.duration || 5000);
      }
    },

    removeNotification(id: string) {
      this.notifications = this.notifications.filter((n: Notification) => n.id !== id);
    },

    success(message: string, duration?: number) {
      this.addNotification({ type: 'success', message, duration });
    },

    error(message: string, duration?: number) {
      this.addNotification({ type: 'error', message, duration });
    },

    info(message: string, duration?: number) {
      this.addNotification({ type: 'info', message, duration });
    }
  }
}); 