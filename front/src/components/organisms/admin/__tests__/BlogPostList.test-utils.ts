import { mount } from '@vue/test-utils'
import BlogPostList from '../BlogPostList.vue'
import type { IBlogPost } from '@/types/blog'

/**
 * Interface for BlogPostList component props
 */
export interface IBlogPostListProps {
  _dummy?: never;
}

/**
 * Mounts the BlogPostList component with the given props
 * @param props - Component props
 * @returns Vue Test Utils wrapper
 */
export const mountBlogPostList = (props: IBlogPostListProps = {}) => {
  return mount(BlogPostList, {
    props,
    global: {
      stubs: {
        AppImage: true,
        AuthorInfo: true,
        AppButton: true
      }
    }
  })
}

/**
 * Creates default props for the BlogPostList component
 * @returns Default props object
 */
export const createDefaultProps = (): IBlogPostListProps => {
  return {}
} 