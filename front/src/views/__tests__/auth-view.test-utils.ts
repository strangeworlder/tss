import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AuthView from '../AuthView.vue';
import type { Component } from 'vue';

/**
 * Creates a mounted AuthView component with the specified options
 * @param options - Mount options for the component
 * @returns A mounted AuthView component
 */
export function createAuthView(options = {}): ReturnType<typeof mount<Component>> {
  setActivePinia(createPinia());
  return mount(AuthView, {
    global: {
      stubs: {
        LoginForm: true,
        RegisterForm: true,
        AppButton: true,
      },
    },
    ...options,
  });
}

/**
 * Creates a mounted AuthView component with the login tab active
 * @param options - Mount options for the component
 * @returns A mounted AuthView component with login tab active
 */
export function createAuthViewWithLoginTab(options = {}): ReturnType<typeof mount<Component>> {
  return createAuthView({
    data() {
      return {
        activeTab: 'login',
      };
    },
    ...options,
  });
}

/**
 * Creates a mounted AuthView component with the register tab active
 * @param options - Mount options for the component
 * @returns A mounted AuthView component with register tab active
 */
export function createAuthViewWithRegisterTab(options = {}): ReturnType<typeof mount<Component>> {
  return createAuthView({
    data() {
      return {
        activeTab: 'register',
      };
    },
    ...options,
  });
}
