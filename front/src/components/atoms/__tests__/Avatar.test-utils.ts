import { mount, type VueWrapper } from '@vue/test-utils'
import Avatar from '../Avatar.vue'
import { createAvatarProps } from './__fixtures__/Avatar.fixture'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  src?: string
  alt: string
  size?: AvatarSize
  name?: string
}

/**
 * Mounts the Avatar component with the given props
 * @param props - Props to pass to the component
 * @returns VueWrapper instance
 */
export const mountAvatar = (props = {}): VueWrapper => {
  return mount(Avatar, {
    props: createAvatarProps(props) as AvatarProps,
  })
}

/**
 * Simulates an image error event
 * @param wrapper - VueWrapper instance
 */
export const simulateImageError = async (wrapper: VueWrapper): Promise<void> => {
  const img = wrapper.find('.avatar__image')
  if (img.exists()) {
    await img.trigger('error')
  }
}

/**
 * Checks if the avatar has error styling
 * @param wrapper - VueWrapper instance
 * @returns boolean indicating if error styling is applied
 */
export const hasErrorStyling = (wrapper: VueWrapper): boolean => {
  return wrapper.classes().includes('avatar--error')
}

/**
 * Gets the initials text from the avatar
 * @param wrapper - VueWrapper instance
 * @returns string representing the initials
 */
export const getInitials = (wrapper: VueWrapper): string => {
  const placeholder = wrapper.find('.avatar__placeholder')
  return placeholder.exists() ? placeholder.text() : ''
}

/**
 * Checks if the avatar is showing the image
 * @param wrapper - VueWrapper instance
 * @returns boolean indicating if image is displayed
 */
export const isShowingImage = (wrapper: VueWrapper): boolean => {
  return wrapper.find('.avatar__image').exists()
}
