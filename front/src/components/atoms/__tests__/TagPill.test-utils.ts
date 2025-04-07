import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import TagPill from '../TagPill.vue'
import { createTagPillProps } from './__fixtures__/TagPill.fixture'

/**
 * Interface for TagPill component props
 */
interface ITagPillProps {
  tag: string
  clickable?: boolean
}

/**
 * Mounts the TagPill component with the given props
 * @param props - The props to pass to the component
 * @returns The mounted component
 */
export function mountTagPill(props: ITagPillProps = createTagPillProps()) {
  const router = createRouter({
    history: createWebHistory(),
    routes: [],
  })

  return mount(TagPill, {
    props,
    global: {
      plugins: [router],
      stubs: {
        'router-link': true,
      },
    },
  })
}

/**
 * Creates a default set of props for the TagPill component
 * @param overrides - Props to override the defaults
 * @returns The props for the TagPill component
 */
export function createDefaultTagPillProps(overrides: Partial<ITagPillProps> = {}) {
  return {
    tag: 'test-tag',
    clickable: true,
    ...overrides,
  }
}
