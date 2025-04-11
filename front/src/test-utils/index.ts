/**
 * Test Utilities
 *
 * This file provides a centralized set of testing utilities for the project.
 * It abstracts away the direct dependency on testing frameworks to allow for
 * easier framework switching and consistent testing patterns.
 */

// Import testing framework functions
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from '@jest/globals';
import { mount, shallowMount } from '@vue/test-utils';
import type { Component } from 'vue';

// Re-export core testing functions
export { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll };

// Re-export Vue Test Utils
export { mount, shallowMount };

// Re-export jest as vi for compatibility with existing tests
export const vi = jest;

/**
 * Creates a mock for a Pinia store
 * @param storeName - The name of the store to mock
 * @param mockImplementation - The mock implementation of the store
 * @returns A mock function for the store
 */
export function createStoreMock<T>(storeName: string, mockImplementation: Partial<T>): () => T {
  return jest.fn(() => mockImplementation as T);
}

/**
 * Creates a mock for a component
 * @param componentName - The name of the component to mock
 * @param mockImplementation - The mock implementation of the component
 * @returns A mock component
 */
export function createComponentMock(
  componentName: string,
  mockImplementation: Partial<Component>
): Component {
  return {
    name: componentName,
    render: () => null,
    ...mockImplementation,
  } as Component;
}

/**
 * Creates a mock for an API service
 * @param serviceName - The name of the service to mock
 * @param mockImplementation - The mock implementation of the service
 * @returns A mock object for the service
 */
export function createServiceMock<T>(serviceName: string, mockImplementation: Partial<T>): T {
  return mockImplementation as T;
}

/**
 * Creates a mock for an event
 * @param eventName - The name of the event to mock
 * @returns A mock function for the event
 */
export function createEventMock(eventName: string): () => void {
  return jest.fn();
}

/**
 * Creates a mock for a DOM element
 * @param elementName - The name of the element to mock
 * @param mockImplementation - The mock implementation of the element
 * @returns A mock element
 */
export function createElementMock(
  elementName: string,
  mockImplementation: Partial<HTMLElement>
): HTMLElement {
  return {
    tagName: elementName.toUpperCase(),
    ...mockImplementation,
  } as HTMLElement;
}
