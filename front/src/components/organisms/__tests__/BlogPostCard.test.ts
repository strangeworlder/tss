import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogPostCard from '../BlogPostCard.vue'
import { BlogPostTitleVariantEnum } from '@/types/blogPost'
import type { Author } from '@/types/blog'

// Mock child components
vi.mock('@/components/atoms/BlogPostTitle.vue', () => ({
  default: {
    name: 'BlogPostTitle',
    props: ['title', 'variant'],
    template: '<h2 class="blog-post-title">{{ title }}</h2>'
  }
}))

vi.mock('@/components/atoms/BlogPostImage.vue', () => ({
  default: {
    name: 'BlogPostImage',
    props: ['filename', 'url', 'alt', 'variant'],
    template: '<img class="blog-post-image" :alt="alt" />'
  }
}))

vi.mock('@/components/molecules/BlogPostMeta.vue', () => ({
  default: {
    name: 'BlogPostMeta',
    props: ['date', 'author'],
    template: '<div class="blog-post-meta">{{ date }} by {{ author.name }}</div>'
  }
}))

vi.mock('@/components/molecules/BlogPostTags.vue', () => ({
  default: {
    name: 'BlogPostTags',
    props: ['tags'],
    template: '<div class="blog-post-tags">{{ tags.join(", ") }}</div>'
  }
}))

vi.mock('@/components/molecules/BlogPostExcerpt.vue', () => ({
  default: {
    name: 'BlogPostExcerpt',
    props: ['content', 'variant'],
    template: '<div class="blog-post-excerpt">{{ content }}</div>'
  }
}))

vi.mock('@/components/atoms/ReadMoreButton.vue', () => ({
  default: {
    name: 'ReadMoreButton',
    props: ['to'],
    template: '<a :href="to" class="read-more-button">Read More</a>'
  }
}))

describe('BlogPostCard', () => {
  const defaultProps = {
    title: 'Test Blog Post',
    date: '2023-01-01',
    author: {
      name: 'Test Author',
      type: 'text',
      id: '123'
    } as Author,
    content: 'This is a test blog post content',
    slug: 'test-blog-post',
    variant: BlogPostTitleVariantEnum.FULL,
    tags: ['test', 'blog']
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders properly with all props', () => {
    const wrapper = mount(BlogPostCard, {
      props: defaultProps
    })
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.blog-post-card').exists()).toBe(true)
    expect(wrapper.find('.blog-post-title').text()).toBe('Test Blog Post')
    expect(wrapper.find('.blog-post-meta').text()).toContain('Test Author')
    expect(wrapper.find('.blog-post-tags').text()).toBe('test, blog')
    expect(wrapper.find('.blog-post-excerpt').text()).toBe('This is a test blog post content')
    expect(wrapper.find('.read-more-button').attributes('href')).toBe('/blog/test-blog-post')
  })

  it('renders with minimal required props', () => {
    const wrapper = mount(BlogPostCard, {
      props: {
        title: 'Minimal Blog Post',
        date: '',
        author: {
          name: 'Anonymous',
          type: 'text',
          id: undefined
        } as Author,
        content: '',
        slug: 'minimal-blog-post'
      }
    })
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.blog-post-title').text()).toBe('Minimal Blog Post')
    expect(wrapper.find('.blog-post-meta').text()).toContain('Anonymous')
    expect(wrapper.find('.blog-post-tags').exists()).toBe(false)
    expect(wrapper.find('.read-more-button').attributes('href')).toBe('/blog/minimal-blog-post')
  })

  it('applies compact variant class correctly', () => {
    const wrapper = mount(BlogPostCard, {
      props: {
        ...defaultProps,
        variant: BlogPostTitleVariantEnum.COMPACT
      }
    })
    
    expect(wrapper.find('.blog-post-card--compact').exists()).toBe(true)
    expect(wrapper.find('.blog-post-card--full').exists()).toBe(false)
  })

  it('applies full variant class correctly', () => {
    const wrapper = mount(BlogPostCard, {
      props: {
        ...defaultProps,
        variant: BlogPostTitleVariantEnum.FULL
      }
    })
    
    expect(wrapper.find('.blog-post-card--full').exists()).toBe(true)
    expect(wrapper.find('.blog-post-card--compact').exists()).toBe(false)
  })

  it('does not render tags in compact variant', () => {
    const wrapper = mount(BlogPostCard, {
      props: {
        ...defaultProps,
        variant: BlogPostTitleVariantEnum.COMPACT
      }
    })
    
    expect(wrapper.find('.blog-post-tags').exists()).toBe(false)
  })

  it('renders tags in full variant', () => {
    const wrapper = mount(BlogPostCard, {
      props: {
        ...defaultProps,
        variant: BlogPostTitleVariantEnum.FULL
      }
    })
    
    expect(wrapper.find('.blog-post-tags').exists()).toBe(true)
    expect(wrapper.find('.blog-post-tags').text()).toBe('test, blog')
  })

  it('does not render tags when tags array is empty', () => {
    const wrapper = mount(BlogPostCard, {
      props: {
        ...defaultProps,
        tags: []
      }
    })
    
    expect(wrapper.find('.blog-post-tags').exists()).toBe(false)
  })

  it('uses title as alt text for image when heroImageAlt is not provided', () => {
    const wrapper = mount(BlogPostCard, {
      props: {
        ...defaultProps,
        heroImageFilename: 'test-image.jpg'
      }
    })
    
    expect(wrapper.find('.blog-post-image').attributes('alt')).toBe('Test Blog Post')
  })

  it('uses provided heroImageAlt for image alt text', () => {
    const wrapper = mount(BlogPostCard, {
      props: {
        ...defaultProps,
        heroImageFilename: 'test-image.jpg',
        heroImageAlt: 'Custom Alt Text'
      }
    })
    
    expect(wrapper.find('.blog-post-image').attributes('alt')).toBe('Custom Alt Text')
  })

  it('passes correct props to child components', () => {
    const wrapper = mount(BlogPostCard, {
      props: defaultProps
    })
    
    // Check BlogPostTitle props
    const titleComponent = wrapper.findComponent({ name: 'BlogPostTitle' })
    expect(titleComponent.props('title')).toBe('Test Blog Post')
    expect(titleComponent.props('variant')).toBe(BlogPostTitleVariantEnum.FULL)
    
    // Check BlogPostImage props
    const imageComponent = wrapper.findComponent({ name: 'BlogPostImage' })
    expect(imageComponent.props('filename')).toBe('test-image.jpg')
    expect(imageComponent.props('variant')).toBe(BlogPostTitleVariantEnum.FULL)
    
    // Check BlogPostMeta props
    const metaComponent = wrapper.findComponent({ name: 'BlogPostMeta' })
    expect(metaComponent.props('date')).toBe('2023-01-01')
    expect(metaComponent.props('author')).toEqual({
      name: 'Test Author',
      type: 'text',
      id: '123'
    })
    
    // Check BlogPostExcerpt props
    const excerptComponent = wrapper.findComponent({ name: 'BlogPostExcerpt' })
    expect(excerptComponent.props('content')).toBe('This is a test blog post content')
    expect(excerptComponent.props('variant')).toBe(BlogPostTitleVariantEnum.FULL)
    
    // Check ReadMoreButton props
    const buttonComponent = wrapper.findComponent({ name: 'ReadMoreButton' })
    expect(buttonComponent.props('to')).toBe('/blog/test-blog-post')
  })
}) 