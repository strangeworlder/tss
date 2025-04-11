import { mount } from '@vue/test-utils';
import NotificationBadge from '../NotificationBadge.vue';
import type { NotificationStore } from '@/stores/notification';
import { useNotificationStore } from '@/stores/notification';
import { describe, it, expect, vi, createStoreMock } from '@/test-utils';

// Mock the notification store
vi.mock('@/stores/notification', () => ({
  useNotificationStore: createStoreMock<NotificationStore>('notification', {
    unreadCount: 0,
  }),
}));

describe('NotificationBadge', () => {
  it('renders correctly with no unread notifications', () => {
    const wrapper = mount(NotificationBadge);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).not.toContain('notification-badge--has-unread');
  });

  it('renders correctly with unread notifications', () => {
    const wrapper = mount(NotificationBadge, {
      props: {
        count: 5,
      },
    });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).toContain('notification-badge--has-unread');
  });

  it('emits click event when clicked', async () => {
    const wrapper = mount(NotificationBadge);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('uses store unread count when no count prop is provided', () => {
    const mockStore = {
      unreadCount: 3,
    } satisfies Partial<NotificationStore>;

    vi.mocked(useNotificationStore).mockReturnValue(mockStore as NotificationStore);

    const wrapper = mount(NotificationBadge);
    expect(wrapper.classes()).toContain('notification-badge--has-unread');
  });
});
