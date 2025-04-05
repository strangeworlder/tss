import { describe, it, expect, vi } from 'vitest'
import { mountButton, createDefaultButtonProps } from './Button.test-utils'
import { ButtonVariantEnum } from '@/types/button'
import { mockButtons } from './__fixtures__/Button.fixture'

describe('Button', () => {
  it('renders correctly with default props', () => {
    const wrapper = mountButton()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.classes()).toContain('button--primary')
  })

  it('renders correctly with secondary variant', () => {
    const wrapper = mountButton(mockButtons.secondary)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('button--secondary')
  })

  it('renders correctly with danger variant', () => {
    const wrapper = mountButton(mockButtons.danger)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('button--danger')
  })

  it('renders correctly with text variant', () => {
    const wrapper = mountButton(mockButtons.text)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('button--text')
  })

  it('renders correctly when disabled', () => {
    const wrapper = mountButton(mockButtons.disabled)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('button--disabled')
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('renders as a router-link when to prop is provided', () => {
    const wrapper = mountButton(mockButtons.withTo)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('to')).toBe('/some-path')
  })

  it('renders with aria-label only when ariaLabel prop is provided', () => {
    const wrapper = mountButton(mockButtons.withAriaLabel)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.attributes('aria-label')).toBe('Accessible Button')
    
    // When no ariaLabel is provided, aria-label should not be present
    const wrapperWithoutAriaLabel = mountButton(createDefaultButtonProps())
    expect(wrapperWithoutAriaLabel.attributes('aria-label')).toBeUndefined()
  })

  it('emits click event when clicked', async () => {
    const wrapper = mountButton()
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click event when disabled', async () => {
    const wrapper = mountButton(mockButtons.disabled)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('emits click event when Enter key is pressed', async () => {
    const wrapper = mountButton()
    await wrapper.trigger('keydown.enter')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('emits click event when Space key is pressed', async () => {
    const wrapper = mountButton()
    await wrapper.trigger('keydown.space')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click event when disabled and Enter key is pressed', async () => {
    const wrapper = mountButton(mockButtons.disabled)
    await wrapper.trigger('keydown.enter')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('does not emit click event when disabled and Space key is pressed', async () => {
    const wrapper = mountButton(mockButtons.disabled)
    await wrapper.trigger('keydown.space')
    expect(wrapper.emitted('click')).toBeFalsy()
  })
}) 