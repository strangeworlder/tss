import { mount } from '@vue/test-utils';
import NotificationList from '../NotificationList.vue';
import type { INotification } from '@/types/notification';
import { NotificationTypeEnum } from '@/types/notification';

export interface INotificationListProps {
  notifications: INotification[];
}

export const mountNotificationList = (props: INotificationListProps) => {
  return mount(NotificationList, {
    props,
  });
};

export const createDefaultNotificationListProps = (): INotificationListProps => {
  return {
    notifications: [
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
  };
};
