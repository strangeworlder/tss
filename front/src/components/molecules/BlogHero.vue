<!--
 * BlogHero Component
 *
 * A hero component for blog posts that displays a full-width image with content overlay.
 * Supports custom alt text and uses the AppImage component for image handling.
 *
 * Features:
 * - Full-width hero image display at the top of the page
 * - Fixed height with max-height constraint
 * - Content overlay with gradient background
 * - Responsive design
 * - Customizable alt text
 * - Thumbnail that opens a full-size image modal when clicked (only shown when heroImage is provided)
 * - Uses placeholder image when no hero image is provided
 *
 * Props:
 * - heroImage (String, optional): The filename of the hero image
 * - altText (String, default: 'Blog hero image'): Alternative text for the image
 *
 * Slots:
 * - default: Content to display over the hero image
 *
 * Accessibility:
 * - Uses semantic HTML
 * - Provides alt text for the image
 * - Ensures content is readable with gradient overlay
 * - Keyboard navigation support for thumbnail and modal
 -->
<template>
  <div class="blog-hero">
    <app-image
      :filename="heroImage || 'placeholder1.webp'"
      :size="ImageSizeEnum.HERO"
      :alt="altText"
      class="blog-hero__image"
    />
    <div class="blog-hero__content">
      <!-- Content overlaying the hero image -->
      <div class="blog-hero__wrapper">
        <div class="blog-hero__wrapper-inner">
          <gallery-thumbnail
            v-if="heroImage"
            :image-filename="heroImage"
            :alt-text="altText"
            :position="{ top: 'calc(-1 * var(--spacing-xl))', right: '0' }"
            @click="handleThumbnailClick"
          />
        </div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppImage from '@/components/atoms/AppImage.vue';
import GalleryThumbnail from '@/components/atoms/GalleryThumbnail.vue';
import { ImageSizeEnum } from '@/types/image';

export default defineComponent({
  name: 'BlogHero',

  components: {
    AppImage,
    GalleryThumbnail,
  },

  props: {
    heroImage: {
      type: String,
      required: false,
    },
    altText: {
      type: String,
      default: 'Blog hero image',
    },
  },

  setup() {
    const handleThumbnailClick = (): void => {
      console.log('Thumbnail clicked in BlogHero');
    };

    return {
      ImageSizeEnum,
      handleThumbnailClick,
    };
  },
});
</script>

<style scoped>
.blog-hero {
  position: absolute;
  width: 94vw;
  height: 60rem;
  max-height: 50vh;
  overflow: hidden;
  margin-left: calc(-47vw + 50%);
  margin-right: calc(-47vw + 50%);
  top: 0;
  left: 0;
}

.blog-hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-hero__content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--spacing-xl);
  color: var(--color-background);
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--color-background) 20%, transparent),
    color-mix(in srgb, var(--color-background) 100%, transparent)
  );
}

.blog-hero__wrapper {
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--color-background) 50%, transparent),
    color-mix(in srgb, var(--color-background) 90%, transparent),
    var(--color-background)
  );

  max-width: 40rem;
  margin: var(--spacing-xl) auto;
  width: 100%;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.blog-hero__wrapper-inner {
  position: absolute;
    margin: var(--spacing-3xl) var(--spacing-lg);
    right: 0;
}
.blog-hero__wrapper :deep(h2) {
  font-size: 2.2rem;
    color: var(--color-text);
    margin: 5rem 1rem;
}
.blog-hero :deep(.image-component) {
  border-radius: 0;
}

/* Style the GalleryThumbnail component */
.blog-hero__wrapper :deep(.gallery-thumbnail) {
  position: absolute;
  top: calc(-1 * var(--spacing-xl));
  right: 0;
  width: 5rem;
  height: 5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 0.25rem solid var(--color-background);
  box-shadow: 0 0.25rem 0.5rem color-mix(in srgb, var(--color-text) 20%, transparent);
  z-index: 1;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.blog-hero__wrapper :deep(.gallery-thumbnail:hover) {
  transform: scale(1.05);
}

.blog-hero__wrapper :deep(.gallery-thumbnail__image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
