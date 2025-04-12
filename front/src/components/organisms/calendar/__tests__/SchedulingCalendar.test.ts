import { describe, it, expect, jest } from '@jest/globals';
import { mount } from '@vue/test-utils';
import SchedulingCalendar from '../SchedulingCalendar.vue';
import type { ISchedule } from '@/types/scheduling';

describe('SchedulingCalendar', () => {
  it('renders correctly', () => {
    const wrapper = mount(SchedulingCalendar, {
      props: {
        schedules: [],
        onSchedule: jest.fn(),
        onUnschedule: jest.fn(),
        onSuggestSchedule: jest.fn(),
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('displays schedules correctly', () => {
    const schedules: ISchedule[] = [
      {
        id: '1',
        title: 'Test Schedule',
        startTime: new Date(),
        status: 'scheduled',
        hasConflict: false,
      },
    ];
    const wrapper = mount(SchedulingCalendar, {
      props: {
        schedules,
        onSchedule: jest.fn(),
        onUnschedule: jest.fn(),
        onSuggestSchedule: jest.fn(),
      },
    });
    expect(wrapper.text()).toContain('Test Schedule');
  });

  it('handles schedule selection', async () => {
    const schedules: ISchedule[] = [
      {
        id: '1',
        title: 'Test Schedule',
        startTime: new Date(),
        status: 'scheduled',
        hasConflict: false,
      },
    ];
    const wrapper = mount(SchedulingCalendar, {
      props: {
        schedules,
        onSchedule: jest.fn(),
        onUnschedule: jest.fn(),
        onSuggestSchedule: jest.fn(),
      },
    });
    await wrapper.find('.scheduling-calendar__schedule').trigger('click');
    expect(wrapper.find('.scheduling-calendar__details').exists()).toBe(true);
  });

  it('handles suggestion selection', async () => {
    const onSuggestSchedule = jest.fn();
    const wrapper = mount(SchedulingCalendar, {
      props: {
        schedules: [],
        onSchedule: jest.fn(),
        onUnschedule: jest.fn(),
        onSuggestSchedule,
      },
    });
    await wrapper.find('.scheduling-calendar__suggestion').trigger('click');
    expect(onSuggestSchedule).toHaveBeenCalled();
  });

  it('is accessible', () => {
    const wrapper = mount(SchedulingCalendar, {
      props: {
        schedules: [],
        onSchedule: jest.fn(),
        onUnschedule: jest.fn(),
        onSuggestSchedule: jest.fn(),
      },
    });
    expect(wrapper.find('[role="grid"]').exists()).toBe(true);
    expect(wrapper.find('[role="row"]').exists()).toBe(true);
    expect(wrapper.find('[role="cell"]').exists()).toBe(true);
  });
});
