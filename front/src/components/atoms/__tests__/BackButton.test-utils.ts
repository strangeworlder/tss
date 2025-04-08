import { mount, type VueWrapper } from '@vue/test-utils';
import { vi } from 'vitest';
import BackButton from '../BackButton.vue';
import { createBackButtonProps } from './__fixtures__/BackButton.fixture';
import type { Router } from 'vue-router';

interface BackButtonProps {
  text?: string;
  to?: string;
}

/**
 * Mounts the BackButton component with the given props
 * @param props - Props to pass to the component
 * @returns VueWrapper instance
 */
export const mountBackButton = (props = {}): VueWrapper => {
  return mount(BackButton, {
    props: createBackButtonProps(props) as BackButtonProps,
    global: {
      stubs: {
        'router-link': true,
      },
    },
  });
};

/**
 * Simulates a click on the back button
 * @param wrapper - VueWrapper instance
 */
export const clickBackButton = async (wrapper: VueWrapper): Promise<void> => {
  await wrapper.find('.back-button').trigger('click');
};

/**
 * Simulates a keyboard enter press on the back button
 * @param wrapper - VueWrapper instance
 */
export const pressEnterOnBackButton = async (wrapper: VueWrapper): Promise<void> => {
  await wrapper.find('.back-button').trigger('keydown.enter');
};

/**
 * Gets the text content of the back button
 * @param wrapper - VueWrapper instance
 * @returns The text content of the button
 */
export const getButtonText = (wrapper: VueWrapper): string => {
  return wrapper.find('.back-button').text().trim();
};

/**
 * Checks if the router push was called with the correct path
 * @param wrapper - VueWrapper instance
 * @param expectedPath - Expected path to be pushed
 * @returns boolean indicating if router.push was called with the expected path
 */
export const wasRouterPushCalledWith = (wrapper: VueWrapper, expectedPath: string): boolean => {
  const routerPushMock = wrapper.vm.$router.push as unknown as { mock: { calls: string[][] } };
  return routerPushMock.mock.calls.some((call: string[]) => call[0] === expectedPath);
};
