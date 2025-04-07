import type { INotification } from '@/types/notification'
import { NotificationTypeEnum } from '@/types/notification'

export const createNotificationListProps = (notifications: INotification[] = []) => {
  return {
    notifications:
      notifications.length > 0
        ? notifications
        : [
            {
              id: '1',
              type: NotificationTypeEnum.SUCCESS,
              message: 'Success message',
            },
            {
              id: '2',
              type: NotificationTypeEnum.ERROR,
              message: 'Error message',
            },
          ],
  }
}

export const mockNotificationLists = {
  default: createNotificationListProps(),
  empty: createNotificationListProps([]),
  allTypes: createNotificationListProps([
    { id: '1', type: NotificationTypeEnum.SUCCESS, message: 'Success' },
    { id: '2', type: NotificationTypeEnum.ERROR, message: 'Error' },
    { id: '3', type: NotificationTypeEnum.WARNING, message: 'Warning' },
    { id: '4', type: NotificationTypeEnum.INFO, message: 'Info' },
  ]),
  longMessages: createNotificationListProps([
    {
      id: '1',
      type: NotificationTypeEnum.SUCCESS,
      message: 'This is a very long success message that should be truncated',
    },
    {
      id: '2',
      type: NotificationTypeEnum.ERROR,
      message: 'This is a very long error message that should be truncated',
    },
  ]),
}
