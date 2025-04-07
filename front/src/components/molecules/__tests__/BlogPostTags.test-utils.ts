import { mount } from '@vue/test-utils'
import BlogPostTags from '../BlogPostTags.vue'
import type { Props } from '../BlogPostTags.types'

/**
 * Mounts the BlogPostTags component with the given props
 * @param props - The props to pass to the component
 * @returns The mounted component
 */
export function mountComponent(props: Props) {
  return mount(BlogPostTags, {
    props,
    global: {
      stubs: {
        TagPill: {
          template:
            '<div class="tag-pill-stub" :class="$attrs.class" v-bind="$attrs">{{ tag }}</div>',
          props: ['tag'],
        },
      },
    },
  })
}

/**
 * Creates default props for the BlogPostTags component
 * @param overrides - Props to override the defaults
 * @returns The props for the component
 */
export function createDefaultProps(overrides: Partial<Props> = {}): Props {
  return {
    tags: ['default', 'tags'],
    ...overrides,
  }
}
