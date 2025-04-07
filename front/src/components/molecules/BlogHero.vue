<!--
 * BlogHero Component
 *
 * A hero component for blog posts that displays a full-width image with content overlay.
 * Supports custom alt text and uses the AppImage component for image handling.
 *
 * Features:
 * - Full-width hero image display
 * - Content overlay with gradient background
 * - Responsive design
 * - Customizable alt text
 *
 * Props:
 * - heroImage (String, required): The filename of the hero image
 * - altText (String, default: 'Blog hero image'): Alternative text for the image
 *
 * Slots:
 * - default: Content to display over the hero image
 *
 * Accessibility:
 * - Uses semantic HTML
 * - Provides alt text for the image
 * - Ensures content is readable with gradient overlay
 -->
<template>
  <div class="blog-hero">
    <app-image
      :filename="heroImage"
      :size="ImageSizeEnum.FULL"
      :alt="altText"
      class="blog-hero__image"
    />
    <div class="blog-hero__content">
      <!-- Content overlaying the hero image -->
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppImage from '@/components/atoms/AppImage.vue';
import { ImageSizeEnum } from '@/types/image';

export default defineComponent({
  name: 'BlogHero',

  components: {
    AppImage,
  },

  props: {
    heroImage: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      default: 'Blog hero image',
    },
  },

  setup() {
    return {
      ImageSizeEnum,
    };
  },
});
</script>

<style scoped>
.blog-hero {
  position: relative;
  width: 100%;
  height: var(--blog-image-height-full);
  overflow: hidden;
  border-radius: var(--border-radius);
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
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--color-background);
  background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6));
}
</style>
