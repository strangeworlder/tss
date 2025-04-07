<template>
  <div 
    class="avatar" 
    :class="[
      `avatar--${size}`,
      { 'avatar--error': hasError }
    ]"
  >
    <img
      v-if="src && !hasError"
      :src="imageUrl"
      :alt="alt"
      class="avatar__image"
      @error="handleImageError"
    />
    <img
      v-else
      :src="placeholderUrl"
      :alt="alt"
      class="avatar__image avatar__image--placeholder"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getImageUrl } from '@/api/imageService';
import { ImageSizeEnum, ImageFormatEnum } from '@/types/image';

/**
 * Avatar Component
 *
 * A reusable avatar component that displays a user's profile image or a placeholder image as a fallback.
 * Supports different sizes and handles image loading errors gracefully.
 *
 * @example
 * <Avatar
 *   src="avatar-123456-1621234567890.webp"
 *   alt="John Doe's profile"
 *   size="md"
 * />
 */

/**
 * Size options for the avatar component
 */
type AvatarSize = 'sm' | 'md' | 'lg';

/**
 * Avatar component props interface
 */
interface IProps {
  /**
   * Source filename of the avatar image (from user.avatar.filename)
   * Can be a full URL (starting with http:// or /) or just the filename
   */
  src?: string;
  /**
   * Alternative text for the image (required for accessibility)
   */
  alt: string;
  /**
   * Size of the avatar component (sm, md, lg)
   */
  size?: AvatarSize;
}

const props = withDefaults(defineProps<IProps>(), {
  src: undefined,
  size: 'md',
});

const hasError = ref(false);

// Map component size to ImageSize enum for API
const getImageSize = (size?: string): ImageSizeEnum => {
  switch (size) {
    case 'sm':
      return ImageSizeEnum.THUMBNAIL;
    case 'md':
      return ImageSizeEnum.MEDIUM;
    case 'lg':
      return ImageSizeEnum.FULL;
    default:
      return ImageSizeEnum.THUMBNAIL;
  }
};

/**
 * Computed image URL based on src prop and size
 */
const imageUrl = computed(() => {
  if (hasError.value || !props.src) return '';

  // If src is a full URL, use it directly
  if (props.src.startsWith('http') || props.src.startsWith('/')) {
    return props.src;
  }

  // Backend stores avatar images in /uploads/images/ directory
  // Using imageService to get proper URLs with sizing
  return getImageUrl(props.src, getImageSize(props.size), ImageFormatEnum.WEBP);
});

/**
 * Computed placeholder image URL
 */
const placeholderUrl = computed(() => {
  return getImageUrl('placeholder1.webp', getImageSize(props.size), ImageFormatEnum.WEBP);
});

/**
 * Handles image loading errors and switches to placeholder
 */
const handleImageError = () => {
  hasError.value = true;
};
</script>

<style scoped>
.avatar {
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-background-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
  border: 0.125rem solid transparent;
}

.avatar--error {
  background-color: var(--color-danger-light);
  border-color: var(--color-border-error);
}

/* 
  Sizes that match backend avatar processing:
  - sm: thumbnail (150×150px in backend)
  - md: medium (matches 200×200px in backend avatar processing)
  - lg: full (matches larger size in backend)
*/
.avatar--sm {
  width: var(--avatar-size-sm, var(--spacing-xl));
  height: var(--avatar-size-sm, var(--spacing-xl));
}

.avatar--md {
  width: var(--avatar-size-md, var(--spacing-2xl));
  height: var(--avatar-size-md, var(--spacing-2xl));
}

.avatar--lg {
  width: var(--avatar-size-lg, var(--spacing-3xl));
  height: var(--avatar-size-lg, var(--spacing-3xl));
}

.avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar__image--placeholder {
  opacity: 0.7;
}
</style>
