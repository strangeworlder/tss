import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  function addNotification(notification: Omit<Notification, 'id'>): void {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = { ...notification, id }
    notifications.value.push(newNotification)

    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }
  }

  function removeNotification(id: string): void {
    notifications.value = notifications.value.filter((n: Notification) => n.id !== id)
  }

  function success(message: string, duration?: number): void {
    addNotification({ type: 'success', message, duration })
  }

  function error(message: string, duration?: number): void {
    addNotification({ type: 'error', message, duration })
  }

  function info(message: string, duration?: number): void {
    addNotification({ type: 'info', message, duration })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
  }
})
