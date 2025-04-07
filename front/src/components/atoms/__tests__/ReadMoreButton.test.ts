import { describe, it, expect } from 'vitest'
import { mountReadMoreButton } from './ReadMoreButton.test-utils'
import { mockReadMoreButtons } from './__fixtures__/ReadMoreButton.fixture'
import { ButtonVariantEnum } from '@/types/button'

describe('ReadMoreButton', () => {
  it('renders correctly with default props', () => {
    const wrapper = mountReadMoreButton()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Read More')
  })

  it('passes the correct to prop to the Button component', () => {
    const wrapper = mountReadMoreButton(mockReadMoreButtons.blogPost)
    expect(wrapper.findComponent({ name: 'Button' }).props('to')).toBe('/blog/post-1')
  })

  it('uses the primary variant for the Button component', () => {
    const wrapper = mountReadMoreButton()
    expect(wrapper.findComponent({ name: 'Button' }).props('variant')).toBe(
      ButtonVariantEnum.PRIMARY,
    )
  })

  it('renders with the correct text content', () => {
    const wrapper = mountReadMoreButton()
    expect(wrapper.text().trim()).toBe('Read More')
  })
})
