import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountNotificationList } from './NotificationList.test-utils'
import { mockNotificationLists } from '@/components/molecules/__tests__/__fixtures__/NotificationList.fixture'
import { useNotificationStore } from '@/stores/notification'
import { NotificationTypeEnum } from '@/types/notification'

// Mock the notification store
vi.mock('@/stores/notification')

describe('NotificationList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock the notification store implementation
    vi.mocked(useNotificationStore).mockReturnValue({
      notifications: mockNotificationLists.default.notifications,
      removeNotification: vi.fn(),
    } as unknown)
  })

  // 1. Rendering tests
  it('renders properly with notifications', () => {
    const wrapper = mountNotificationList(mockNotificationLists.default)

    // Check if notifications are rendered
    const items = wrapper.findAll('.notification-list__item')
    expect(items).toHaveLength(2)

    // Check if notifications have correct content
    expect(items[0].text()).toContain('Success message')
    expect(items[1].text()).toContain('Error message')

    // Check if notifications have correct classes
    expect(items[0].classes()).toContain('notification-list__item--success')
    expect(items[1].classes()).toContain('notification-list__item--error')
  })

  it('handles empty state correctly', () => {
    const wrapper = mountNotificationList(mockNotificationLists.empty)

    // Check that no notification items are rendered
    expect(wrapper.findAll('.notification-list__item')).toHaveLength(0)
  })

  // 2. Props tests
  it('renders different notification types correctly', () => {
    const wrapper = mountNotificationList(mockNotificationLists.allTypes)

    // Check if all notification types are rendered with correct classes
    const items = wrapper.findAll('.notification-list__item')
    expect(items[0].classes()).toContain('notification-list__item--success')
    expect(items[1].classes()).toContain('notification-list__item--error')
    expect(items[2].classes()).toContain('notification-list__item--warning')
    expect(items[3].classes()).toContain('notification-list__item--info')
  })

  it('handles long messages correctly', () => {
    const wrapper = mountNotificationList(mockNotificationLists.longMessages)

    const items = wrapper.findAll('.notification-list__item')
    expect(items[0].text()).toContain('This is a very long success message')
    expect(items[1].text()).toContain('This is a very long error message')
  })

  // 3. Event handling tests
  it('handles notification removal', async () => {
    const mockRemoveNotification = vi.fn()
    vi.mocked(useNotificationStore).mockReturnValue({
      notifications: mockNotificationLists.default.notifications,
      removeNotification: mockRemoveNotification,
    } as unknown)

    const wrapper = mountNotificationList(mockNotificationLists.default)

    // Click the close button of the first notification
    await wrapper.find('.notification-list__close').trigger('click')

    // Check if removeNotification was called with correct ID
    expect(mockRemoveNotification).toHaveBeenCalledWith('1')
  })

  // 4. Accessibility tests
  it('maintains accessibility requirements', () => {
    const wrapper = mountNotificationList(mockNotificationLists.default)

    // Check for live region
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)

    // Check for alert role
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)

    // Check for close button accessibility
    const closeButton = wrapper.find('.notification-list__close')
    expect(closeButton.attributes('aria-label')).toBe('Close notification')
  })

  // 5. Animation tests
  it('handles animation classes correctly', async () => {
    const wrapper = mountNotificationList(mockNotificationLists.default)

    // Check for transition group
    expect(wrapper.find('.notification-enter-active').exists()).toBe(false)
    expect(wrapper.find('.notification-leave-active').exists()).toBe(false)

    // Add a new notification
    const newNotifications = [
      ...mockNotificationLists.default.notifications,
      {
        id: '3',
        type: NotificationTypeEnum.INFO,
        message: 'New message',
      },
    ]

    vi.mocked(useNotificationStore).mockReturnValue({
      notifications: newNotifications,
      removeNotification: vi.fn(),
    } as unknown)

    await wrapper.vm.$nextTick()

    // Check for enter animation class
    expect(wrapper.find('.notification-enter-active').exists()).toBe(true)
  })

  // 6. Responsive tests
  it('verifies responsive behavior', async () => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 48rem)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const wrapper = mountNotificationList(mockNotificationLists.default)

    // Trigger resize
    window.dispatchEvent(new Event('resize'))

    // Check if responsive styles are applied
    const list = wrapper.find('.notification-list')
    expect(getComputedStyle(list.element).maxWidth).toBe('none')
  })
})
