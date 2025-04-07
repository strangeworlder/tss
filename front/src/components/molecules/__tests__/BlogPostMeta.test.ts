import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogPostMeta from '../BlogPostMeta.vue'
import AuthorInfo from '../AuthorInfo.vue'
import { createDefaultProps, mockData } from './BlogPostMeta.test-utils'

// Mock the AuthorInfo component
vi.mock('../AuthorInfo.vue', () => ({
  default: {
    name: 'AuthorInfo',
    props: ['author', 'date', 'size'],
    template: '<div class="mock-author-info">{{ author.name }} - {{ date }} - {{ size }}</div>',
  },
}))

describe('BlogPostMeta', () => {
  // Test rendering with all props
  it('renders correctly with date and author', () => {
    const props = createDefaultProps()

    const wrapper = mount(BlogPostMeta, {
      props,
    })

    // Check if date is rendered
    expect(wrapper.find('.blog-post-meta__date').text()).toBe(props.date)

    // Check if AuthorInfo is rendered with correct props
    const authorInfo = wrapper.findComponent(AuthorInfo)
    expect(authorInfo.exists()).toBe(true)
    expect(authorInfo.props('author')).toEqual(props.author)
    expect(authorInfo.props('date')).toBe(props.date)
    expect(authorInfo.props('size')).toBe('sm')
  })

  // Test rendering with only date
  it('renders correctly with only date', () => {
    const props = createDefaultProps({
      author: mockData.authors.anonymous,
    })

    const wrapper = mount(BlogPostMeta, {
      props,
    })

    // Check if date is rendered
    expect(wrapper.find('.blog-post-meta__date').text()).toBe(props.date)

    // Check if AuthorInfo is rendered with default props
    const authorInfo = wrapper.findComponent(AuthorInfo)
    expect(authorInfo.exists()).toBe(true)
    expect(authorInfo.props('author')).toEqual(props.author)
    expect(authorInfo.props('date')).toBe(props.date)
  })

  // Test rendering with only author
  it('renders correctly with only author', () => {
    const props = createDefaultProps({
      date: mockData.dates.empty,
    })

    const wrapper = mount(BlogPostMeta, {
      props,
    })

    // Check if date is not rendered
    expect(wrapper.find('.blog-post-meta__date').exists()).toBe(false)

    // Check if AuthorInfo is rendered with correct props
    const authorInfo = wrapper.findComponent(AuthorInfo)
    expect(authorInfo.exists()).toBe(true)
    expect(authorInfo.props('author')).toEqual(props.author)
    expect(authorInfo.props('date')).toBe(props.date)
  })

  // Test rendering with default props
  it('renders correctly with default props', () => {
    const props = createDefaultProps({
      date: mockData.dates.empty,
      author: mockData.authors.anonymous,
    })

    const wrapper = mount(BlogPostMeta, {
      props,
    })

    // Check if date is not rendered
    expect(wrapper.find('.blog-post-meta__date').exists()).toBe(false)

    // Check if AuthorInfo is rendered with default props
    const authorInfo = wrapper.findComponent(AuthorInfo)
    expect(authorInfo.exists()).toBe(true)
    expect(authorInfo.props('author')).toEqual(props.author)
    expect(authorInfo.props('date')).toBe(props.date)
  })

  // Test accessibility
  it('is accessible', () => {
    const props = createDefaultProps()

    const wrapper = mount(BlogPostMeta, {
      props,
    })

    // Check if the component has semantic HTML
    expect(wrapper.find('div.blog-post-meta').exists()).toBe(true)
    expect(wrapper.find('span.blog-post-meta__date').exists()).toBe(true)
    expect(wrapper.find('div.blog-post-meta__author').exists()).toBe(true)
  })

  // Test responsive behavior
  it('has responsive styling', () => {
    const props = createDefaultProps({
      date: mockData.dates.empty,
      author: mockData.authors.anonymous,
    })

    const wrapper = mount(BlogPostMeta, {
      props,
    })

    // Check if the component uses semantic variables for styling
    const style = wrapper.find('.blog-post-meta').attributes('style')
    expect(style).not.toContain('px')
  })
})
