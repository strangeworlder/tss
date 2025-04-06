export enum NotificationTypeEnum {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface INotification {
  id: string
  type: NotificationTypeEnum
  message: string
  duration?: number // Optional duration in milliseconds before auto-dismissal
} 