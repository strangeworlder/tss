import { mount, type VueWrapper } from '@vue/test-utils';
import BlogPostList from '../BlogPostList.vue';
import type { ComponentMountingOptions } from '@vue/test-utils';
import type { DefineComponent } from 'vue';

/**
 * Mounts the BlogPostList component with the given options
 * @param options - Vue Test Utils mounting options
 * @returns The mounted component wrapper
 */
export function mountBlogPostList(
  options: ComponentMountingOptions<typeof BlogPostList> = {}
): VueWrapper {
  return mount(BlogPostList, {
    global: {
      stubs: {
        AppImage: true,
        AuthorInfo: true,
        AppButton: true,
      },
      ...options.global,
    },
    ...options,
  });
}
