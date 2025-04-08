<!--
 * GalleryThumbnail Component
 *
 * A thumbnail component for displaying images with click interaction.
 * Used in galleries and image previews.
 *
 * Features:
 * - Displays a thumbnail version of an image
 * - Click interaction for opening full view in a modal
 * - Keyboard navigation support
 * - Customizable size and position
 * - Built-in modal for displaying the full-size image
 *
 * Props:
 * - imageFilename (String, required): The filename of the image to display
 * - altText (String, required): Alternative text for the image
 * - size (String, default: 'THUMBNAIL'): Size of the thumbnail
 * - position (Object, optional): Custom positioning { top, right }
 *
 * Events:
 * - click: Emitted when the thumbnail is clicked (before opening modal)
 *
 * Accessibility:
 * - Keyboard navigation support
 * - Proper ARIA roles and labels
 * - Focus management
 */
-->
<template>
  <div>
    <div
      class="gallery-thumbnail"
      :style="positionStyle"
      @click="handleClick"
      @keydown.enter="handleClick"
      role="button"
      tabindex="0"
      :aria-label="`View full size ${altText}`"
    >
      <app-image
        :filename="imageFilename"
        :size="size"
        :alt="altText"
        class="gallery-thumbnail__image"
      />
    </div>
    
    <image-modal
      :is-open="isModalOpen"
      :image-filename="imageFilename"
      :alt-text="altText"
      @close="handleModalClose"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import AppImage from '@/components/atoms/AppImage.vue';
import ImageModal from '@/components/atoms/ImageModal.vue';
import { ImageSizeEnum } from '@/types/image';

interface IPosition {
  top?: string;
  right?: string;
}

export default defineComponent({
  name: 'GalleryThumbnail',

  components: {
    AppImage,
    ImageModal,
  },

  props: {
    imageFilename: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      required: true,
    },
    size: {
      type: String as () => ImageSizeEnum,
      default: ImageSizeEnum.THUMBNAIL,
    },
    position: {
      type: Object as () => IPosition,
      default: () => ({}),
    },
  },

  emits: ['click'],

  setup(props, { emit }) {
    const isModalOpen = ref(false);

    const positionStyle = computed(() => ({
      top: props.position.top,
      right: props.position.right,
    }));

    const handleClick = (): void => {
      console.log('GalleryThumbnail clicked, opening modal with full-sized image');
      emit('click');
      isModalOpen.value = true;
    };

    const handleModalClose = (): void => {
      console.log('Modal closing');
      isModalOpen.value = false;
    };

    // Log the image URL when the modal opens to verify it's using the full-size image
    watch(
      () => isModalOpen.value,
      (newValue) => {
        if (newValue) {
          console.log('GalleryThumbnail opening modal with full-size image:', props.imageFilename);
        }
      }
    );

    return {
      ImageSizeEnum,
      positionStyle,
      handleClick,
      isModalOpen,
      handleModalClose,
    };
  },
});
</script>

<style scoped>
.gallery-thumbnail {
  position: absolute;
  width: 5rem;
  height: 5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  border: 0.25rem solid var(--color-background);
  box-shadow: 0 0.25rem 0.5rem color-mix(in srgb, var(--color-text) 20%, transparent);
  transition: transform 0.2s ease;
}

.gallery-thumbnail:hover {
  transform: scale(1.05);
}

.gallery-thumbnail:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.gallery-thumbnail__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style> 