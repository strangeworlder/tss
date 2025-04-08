import { describe, it, expect } from 'vitest';
import { mountBlogPostHeader } from './BlogPostHeader.test-utils';
import { mockBlogPostHeaders } from './__fixtures__/BlogPostHeader.fixture';

describe('BlogPostHeader', () => {
  // 1. Rendering tests
  it('renders properly with default props', () => {
    const wrapper = mountBlogPostHeader();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.blog-post-header').exists()).toBe(true);
    expect(wrapper.find('.blog-post-header__title').text()).toBe(
      mockBlogPostHeaders.default.post.title
    );
  });

  // 2. Props tests
  it('renders with showBackButton set to false', () => {
    const wrapper = mountBlogPostHeader(mockBlogPostHeaders.noBackButton);
    expect(wrapper.find('.blog-post-header__back').exists()).toBe(false);
  });

  it('renders with no tags', () => {
    const wrapper = mountBlogPostHeader(mockBlogPostHeaders.noTags);
    expect(wrapper.find('.blog-post-header__tags').exists()).toBe(false);
  });

  it('renders with no published date', () => {
    const wrapper = mountBlogPostHeader(mockBlogPostHeaders.noPublishedDate);
    expect(wrapper.find('.blog-post-header__meta').exists()).toBe(true);
    // AuthorInfo component should handle null publishedAt
  });

  // 3. Content tests
  it('displays the blog post title', () => {
    const wrapper = mountBlogPostHeader();
    expect(wrapper.find('.blog-post-header__title').text()).toBe(
      mockBlogPostHeaders.default.post.title
    );
  });

  it('displays the author information', () => {
    const wrapper = mountBlogPostHeader();
    expect(wrapper.find('.blog-post-header__meta').exists()).toBe(true);
    // AuthorInfo component is tested separately
  });

  it('displays tags when present', () => {
    const wrapper = mountBlogPostHeader();
    const tags = wrapper.findAll('.blog-post-header__tag');
    expect(tags.length).toBe(mockBlogPostHeaders.default.post.tags.length);

    // Check that each tag is displayed
    mockBlogPostHeaders.default.post.tags.forEach((tag: string, index: number) => {
      expect(tags[index].text()).toBe(tag);
    });
  });

  // 4. Styling tests
  it('applies correct styling', () => {
    const wrapper = mountBlogPostHeader();
    const element = wrapper.find('.blog-post-header');
    expect(element.exists()).toBe(true);

    // Check that the element has the correct styling
    const styles = window.getComputedStyle(element.element);
    expect(styles.marginBottom).toBe('2rem'); // --spacing-xl is 2rem
  });

  // 5. Accessibility tests
  it('is accessible', () => {
    const wrapper = mountBlogPostHeader();

    // Check that the heading is properly structured
    const title = wrapper.find('h1');
    expect(title.exists()).toBe(true);
    expect(title.classes()).toContain('blog-post-header__title');
  });

  // 6. Responsive behavior tests
  it('handles long titles appropriately', () => {
    const wrapper = mountBlogPostHeader(mockBlogPostHeaders.longTitle);
    const title = wrapper.find('.blog-post-header__title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe(mockBlogPostHeaders.longTitle.post.title);
  });

  // 7. Edge case tests
  it('handles empty title gracefully', () => {
    const wrapper = mountBlogPostHeader({
      post: {
        ...mockBlogPostHeaders.default.post,
        title: '',
      },
    });
    expect(wrapper.find('.blog-post-header__title').exists()).toBe(true);
    expect(wrapper.find('.blog-post-header__title').text()).toBe('');
  });
});
