import { describe, it, expect, vi } from 'vitest'
import { mountTagPill } from './TagPill.test-utils'
import { mockTagPills } from './__fixtures__/TagPill.fixture'

describe('TagPill', () => {
  it('renders correctly with default props', () => {
    const wrapper = mountTagPill()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toBe('test tag')
  })

  it('renders correctly when not clickable', () => {
    const wrapper = mountTagPill(mockTagPills.nonClickable)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.attributes('role')).toBe('link')
  })

  it('formats tag text correctly by replacing hyphens', () => {
    const wrapper = mountTagPill(mockTagPills.withHyphens)
    expect(wrapper.text()).toBe('test tag with hyphens')
  })

  it('has correct accessibility attributes when clickable', () => {
    const wrapper = mountTagPill()
    expect(wrapper.attributes('role')).toBe('link')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.attributes('aria-label')).toBe('Tag: test tag')
  })

  it('navigates to correct route when clicked', async () => {
    const wrapper = mountTagPill()
    const router = wrapper.vm.$router

    await wrapper.trigger('click')
    expect(router.push).toHaveBeenCalledWith('/blog/tag/test-tag')
  })

  it('does not navigate when not clickable', async () => {
    const wrapper = mountTagPill(mockTagPills.nonClickable)
    const router = wrapper.vm.$router

    await wrapper.trigger('click')
    expect(router.push).not.toHaveBeenCalled()
  })

  it('applies correct styling for primary variant', () => {
    const wrapper = mountTagPill(mockTagPills.primary)
    expect(wrapper.classes()).toContain('tag-pill--primary')
  })

  it('applies correct styling for secondary variant', () => {
    const wrapper = mountTagPill(mockTagPills.secondary)
    expect(wrapper.classes()).toContain('tag-pill--secondary')
  })
}) 