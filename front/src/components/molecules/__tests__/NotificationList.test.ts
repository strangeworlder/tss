import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationList from '../NotificationList.vue'
import { useNotificationStore } from '@/stores/notification'
import type { INotification } from '@/types/notification'
import { NotificationTypeEnum } from '@/types/notification'

// Mock the notification store
vi.mock('@/stores/notification')

describe('NotificationList', () => {
  const mockNotifications: INotification[] = [
    {
      id: '1',
      type: NotificationTypeEnum.SUCCESS,
      message: 'Success message'
    },
    {
      id: '2',
      type: NotificationTypeEnum.ERROR,
      message: 'Error message'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock the notification store implementation
    vi.mocked(useNotificationStore).mockReturnValue({
      notifications: mockNotifications,
      removeNotification: vi.fn()
    } as any)
  })

  it('renders properly with notifications', () => {
    const wrapper = mount(NotificationList)
    
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

  it('handles notification removal', async () => {
    const mockRemoveNotification = vi.fn()
    vi.mocked(useNotificationStore).mockReturnValue({
      notifications: mockNotifications,
      removeNotification: mockRemoveNotification
    } as any)

    const wrapper = mount(NotificationList)
    
    // Click the close button of the first notification
    await wrapper.find('.notification-list__close').trigger('click')
    
    // Check if removeNotification was called with correct ID
    expect(mockRemoveNotification).toHaveBeenCalledWith('1')
  })

  it('maintains accessibility requirements', () => {
    const wrapper = mount(NotificationList)
    
    // Check for live region
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
    
    // Check for alert role
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    
    // Check for close button accessibility
    const closeButton = wrapper.find('.notification-list__close')
    expect(closeButton.attributes('aria-label')).toBe('Close notification')
  })

  it('handles empty state correctly', () => {
    // Mock empty notifications
    vi.mocked(useNotificationStore).mockReturnValue({
      notifications: [],
      removeNotification: vi.fn()
    } as any)

    const wrapper = mount(NotificationList)
    
    // Check that no notification items are rendered
    expect(wrapper.findAll('.notification-list__item')).toHaveLength(0)
  })

  it('renders different notification types correctly', () => {
    const allTypesNotifications: INotification[] = [
      { id: '1', type: NotificationTypeEnum.SUCCESS, message: 'Success' },
      { id: '2', type: NotificationTypeEnum.ERROR, message: 'Error' },
      { id: '3', type: NotificationTypeEnum.WARNING, message: 'Warning' },
      { id: '4', type: NotificationTypeEnum.INFO, message: 'Info' }
    ]

    vi.mocked(useNotificationStore).mockReturnValue({
      notifications: allTypesNotifications,
      removeNotification: vi.fn()
    } as any)

    const wrapper = mount(NotificationList)
    
    // Check if all notification types are rendered with correct classes
    const items = wrapper.findAll('.notification-list__item')
    expect(items[0].classes()).toContain('notification-list__item--success')
    expect(items[1].classes()).toContain('notification-list__item--error')
    expect(items[2].classes()).toContain('notification-list__item--warning')
    expect(items[3].classes()).toContain('notification-list__item--info')
  })

  it('verifies responsive behavior', async () => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
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

    const wrapper = mount(NotificationList)
    
    // Trigger resize
    window.dispatchEvent(new Event('resize'))
    
    // Check if responsive styles are applied
    const list = wrapper.find('.notification-list')
    expect(getComputedStyle(list.element).maxWidth).toBe('none')
  })

  it('handles animation classes correctly', async () => {
    const wrapper = mount(NotificationList)
    
    // Check for transition group
    expect(wrapper.find('.notification-enter-active').exists()).toBe(false)
    expect(wrapper.find('.notification-leave-active').exists()).toBe(false)
    
    // Add a new notification
    const newNotifications = [...mockNotifications, {
      id: '3',
      type: NotificationTypeEnum.INFO,
      message: 'New message'
    }]
    
    vi.mocked(useNotificationStore).mockReturnValue({
      notifications: newNotifications,
      removeNotification: vi.fn()
    } as any)
    
    await wrapper.vm.$nextTick()
    
    // Check for enter animation class
    expect(wrapper.find('.notification-enter-active').exists()).toBe(true)
  })
}) 