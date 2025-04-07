import { mount, type VueWrapper } from '@vue/test-utils'
import AppImage from '../AppImage.vue'
import { createImageProps } from './__fixtures__/AppImage.fixture'

/**
 * Mounts the AppImage component with the given props
 * @param props - Props to pass to the component
 * @returns VueWrapper instance
 */
export const mountAppImage = (props = {}): VueWrapper => {
  return mount(AppImage, {
    props: createImageProps(props),
  })
}

/**
 * Simulates an image error event
 * @param wrapper - VueWrapper instance
 */
export const simulateImageError = async (wrapper: VueWrapper): Promise<void> => {
  await wrapper.trigger('error')
}

/**
 * Checks if the image has error styling
 * @param wrapper - VueWrapper instance
 * @returns boolean indicating if error styling is applied
 */
export const hasErrorStyling = (wrapper: VueWrapper): boolean => {
  return wrapper.classes().includes('image-component--error')
}

/**
 * Gets the current image source
 * @param wrapper - VueWrapper instance
 * @returns string representing the current image source
 */
export const getImageSource = (wrapper: VueWrapper): string => {
  return wrapper.attributes('src') || ''
}
