<script setup lang="ts">
import AppImage from '@/components/atoms/AppImage.vue'
import { ImageSizeEnum } from '@/types/image'
import { computed, ref } from 'vue'
import { getImageUrl } from '@/api/imageService'
import { BlogPostTitleVariantEnum } from '@/types/blogPost'

/**
 * BlogPostImage Component
 *
 * A specialized image component for blog posts that supports different variants
 * and responsive layouts. Wraps the AppImage component with blog-specific styling.
 * 
 * Features:
 * - Supports both filename and direct URL sources
 * - Provides fallback for missing images
 * - Responsive design with different variants
 * - Accessible with proper ARIA attributes
 * - Error handling with visual feedback
 *
 * @example
 * <!-- Basic usage with filename -->
 * <BlogPostImage
 *   filename="blog-post-1.webp"
 *   alt="Blog post featured image"
 *   variant="full"
 * />
 * 
 * @example
 * <!-- Using direct URL -->
 * <BlogPostImage
 *   url="https://example.com/image.jpg"
 *   alt="External blog image"
 *   variant="compact"
 * />
 * 
 * @example
 * <!-- With custom size -->
 * <BlogPostImage
 *   filename="blog-post-2.webp"
 *   alt="Small blog image"
 *   size="thumbnail"
 *   variant="compact"
 * />
 */

/**
 * BlogPostImage component props interface
 */
interface IProps {
  /**
   * The filename of the image to display
   * @default 'placeholder1.webp'
   */
  filename?: string
  /**
   * Direct URL to an image (alternative to filename)
   * If provided, this will be used instead of the filename
   */
  url?: string
  /**
   * Alternative text for the image (required for accessibility)
   */
  alt: string
  /**
   * The size of the image to display
   * @default ImageSizeEnum.MEDIUM
   */
  size?: ImageSizeEnum
  /**
   * The display variant of the image
   * @default 'full'
   */
  variant?: BlogPostTitleVariantEnum
}

const props = withDefaults(defineProps<IProps>(), {
  size: ImageSizeEnum.MEDIUM,
  variant: BlogPostTitleVariantEnum.FULL,
})

// Debug log to see what we're receiving
console.log('BlogPostImage props:', {
  filename: props.filename,
  url: props.url,
  isDirectUrl: props.url && (props.url.startsWith('http') || props.url.startsWith('/')),
  variant: props.variant
})

/**
 * Error state for the image
 */
const hasError = ref(false)

/**
 * Determines if we should use direct URL mode
 */
const isDirectUrl = computed(() => !!props.url && (props.url.startsWith('http') || props.url.startsWith('/')))

/**
 * The filename to use when not using direct URL
 */
const filenameToUse = computed(() => props.filename || 'placeholder1.webp')

/**
 * Handle image loading error
 */
const handleImageError = () => {
  hasError.value = true
}
</script>

<template>
  <div 
    class="blog-post-image" 
    :class="[
      `blog-post-image--${variant}`,
      { 'blog-post-image--error': hasError }
    ]"
    role="img"
    :aria-label="alt"
  >
    <!-- Show error message when an error occurs -->
    <div v-if="hasError" class="blog-post-image__error">
      <span class="blog-post-image__error-text">Image not available</span>
    </div>
    
    <!-- Only show the image when there's no error -->
    <template v-else>
      <!-- Direct URL mode - use an img tag directly -->
      <img
        v-if="isDirectUrl"
        :src="url"
        :alt="alt"
        class="blog-post-image__img"
        @error="handleImageError"
        loading="lazy"
      />
      <!-- Filename mode - use AppImage component -->
      <AppImage
        v-else
        :filename="filenameToUse"
        :size="size"
        :alt="alt"
        class="blog-post-image__img"
        @error="handleImageError"
      />
    </template>
  </div>
</template>

<style scoped>
.blog-post-image {
  margin-bottom: var(--spacing-lg);
  position: relative;
}

.blog-post-image__img {
  width: 100%;
  height: var(--blog-image-height-full);
  object-fit: cover;
}

.blog-post-image--compact .blog-post-image__img {
  height: var(--blog-image-height-compact);
}

.blog-post-image--error {
  background-color: var(--color-background-muted);
  border: 0.0625rem solid var(--color-border-error);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--blog-image-height-compact);
}

.blog-post-image--error.blog-post-image--full {
  min-height: var(--blog-image-height-full);
}

.blog-post-image__error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-muted);
  color: var(--color-text-secondary);
}

.blog-post-image__error-text {
  font-size: var(--font-size-sm);
  text-align: center;
}

@media (min-width: var(--breakpoint-md)) {
  .blog-post-image--full {
    flex: 0 0 40%;
    margin-bottom: 0;
  }

  .blog-post-image--full .blog-post-image__img {
    height: 100%;
  }
}
</style>
