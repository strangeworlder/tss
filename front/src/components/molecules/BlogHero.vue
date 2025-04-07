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
      <div class="blog-hero__wrapper">
        <gallery-thumbnail
          :image-filename="heroImage"
          :alt-text="altText"
          :position="{ top: 'calc(-1 * var(--spacing-xl))', right: '0' }"
          @click="handleThumbnailClick"
        />
        <slot></slot>
      </div>
    </div>
  </div>
  <image-modal
    :is-open="isModalOpen"
    :image-filename="heroImage"
    :alt-text="altText"
    @close="handleModalClose"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import AppImage from '@/components/atoms/AppImage.vue';
import ImageModal from '@/components/atoms/ImageModal.vue';
import GalleryThumbnail from '@/components/atoms/GalleryThumbnail.vue';
import { ImageSizeEnum } from '@/types/image';

export default defineComponent({
  name: 'BlogHero',

  components: {
    AppImage,
    ImageModal,
    GalleryThumbnail,
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
    const isModalOpen = ref(false);

    const handleThumbnailClick = (): void => {
      console.log('Thumbnail clicked, opening modal');
      isModalOpen.value = true;
    };

    const handleModalClose = (): void => {
      console.log('Modal closing');
      isModalOpen.value = false;
    };

    return {
      ImageSizeEnum,
      isModalOpen,
      handleThumbnailClick,
      handleModalClose,
    };
  },
});
</script>

<style scoped>
.blog-hero {
  position: relative;
    width: 94vw;
    height: 30rem;
    max-height: 33vh;
    overflow: hidden;
    margin-left: calc(-47vw + 50%);
    margin-right: calc(-47vw + 50%);}

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
  max-width: 40rem;
  margin: var(--spacing-md) auto;
  width: 100%;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.blog-hero__wrapper :deep(h2) {
  font-size: 2.2rem;
  color: var(--color-text);
}

.blog-hero__thumbnail {
  position: absolute;
  top: calc(-1 * var(--spacing-xl));
  right: 0;
  width: 5rem;
  height: 5rem;
  border-radius: 0.5rem;
  object-fit: cover;
  border: 0.25rem solid var(--color-background);
  box-shadow: 0 0.25rem 0.5rem color-mix(in srgb, var(--color-text) 20%, transparent);
  z-index: 1;
}
</style>
