<template>
  <img
    :src="imageUrl"
    :alt="alt"
    :class="['image-component', { 'image-component--error': hasError }, className]"
    @error="handleImageError"
    :loading="lazy ? 'lazy' : 'eager'"
    :width="width"
    :height="height"
    :aria-label="ariaLabel || alt"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getImageUrl } from '@/api/imageService'
import { ImageSizeEnum, ImageFormatEnum } from '@/types/image'

/**
 * AppImage Component
 *
 * A reusable image component that handles image loading, error states, and responsive sizing.
 * Supports different image sizes and formats through the imageService.
 *
 * @example
 * <AppImage
 *   filename="profile.jpg"
 *   size="medium"
 *   alt="User profile picture"
 *   lazy
 * />
 */

interface IProps {
  /**
   * The filename of the image to display
   */
  filename: string
  /**
   * The size of the image to display (thumbnail, medium, full)
   */
  size?: ImageSizeEnum
  /**
   * The format of the image (original, webp, jpeg, png)
   */
  format?: ImageFormatEnum
  /**
   * Alternative text for the image (required for accessibility)
   */
  alt: string
  /**
   * Additional CSS classes to apply to the image
   */
  className?: string
  /**
   * Fallback image to display if the main image fails to load
   */
  fallback?: string
  /**
   * Whether to lazy load the image
   */
  lazy?: boolean
  /**
   * Width of the image in pixels (optional)
   */
  width?: number | string
  /**
   * Height of the image in pixels (optional)
   */
  height?: number | string
  /**
   * ARIA label for the image (falls back to alt if not provided)
   */
  ariaLabel?: string
}

const props = withDefaults(defineProps<IProps>(), {
  size: ImageSizeEnum.FULL,
  format: ImageFormatEnum.WEBP,
  className: '',
  fallback: 'placeholder1.webp',
  lazy: true,
  width: undefined,
  height: undefined,
  ariaLabel: '',
})

const hasError = ref(false)

const imageUrl = computed(() => {
  if (hasError.value) {
    return getImageUrl(props.fallback, props.size, props.format)
  }
  return getImageUrl(props.filename, props.size, props.format)
})

const handleImageError = () => {
  hasError.value = true
}
</script>

<style scoped>
.image-component {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  background-color: var(--color-background-muted);
  transition: border-color var(--transition-fast);
}

.image-component--error {
  border: 0.0625rem solid var(--color-border-error);
  background-color: var(--color-danger-light);
}
</style>
