<!--
 * ImageModal Component
 *
 * A modal component for displaying images in full-screen.
 * Provides a simple view of images with basic zoom and pan functionality.
 *
 * Features:
 * - Full-screen modal display
 * - Simple zoom toggle on click (fit-to-screen / full-size)
 * - Drag and pan when zoomed in
 * - Maintains zoom state when panning
 * - Keyboard navigation support
 * - Click outside to close
 * - ESC key to close
 * - Always displays the full-size version of the image
 *
 * Props:
 * - isOpen (Boolean, required): Controls modal visibility
 * - imageFilename (String, required): The filename of the image to display
 * - altText (String, required): Alternative text for the image
 *
 * Events:
 * - close: Emitted when the modal should be closed
 *
 * Accessibility:
 * - Uses semantic HTML with dialog element
 * - Keyboard navigation support
 * - Focus management
 * - Screen reader friendly
 */
-->
<template>
  <dialog
    ref="dialogRef"
    class="image-modal"
    :open="isOpen"
    @click="handleBackdropClick"
    @keydown="handleKeyDown"
  >
    <div class="image-modal__content">
      <button
        class="image-modal__close"
        @click="handleClose"
        aria-label="Close image modal"
      >
        ×
      </button>
      <div 
        class="image-modal__image-container"
        :class="{ 
          'image-modal__image-container--zoomed': isZoomed,
          'image-modal__image-container--dragging': isDragging
        }"
        @click="handleContainerClick"
        @mousedown="startDrag"
        @mousemove="drag"
        @mouseup="stopDrag"
        @mouseleave="stopDrag"
        @touchstart="startDrag"
        @touchmove="drag"
        @touchend="stopDrag"
        :style="transformStyle"
      >
        <app-image
          :filename="imageFilename"
          :size="ImageSizeEnum.FULL"
          :alt="altText"
          class="image-modal__image"
          :class="{ 'image-modal__image--zoomed': isZoomed }"
          ref="imageRef"
        />
      </div>
    </div>
  </dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onUnmounted, computed } from 'vue';
import AppImage from '@/components/atoms/AppImage.vue';
import { ImageSizeEnum } from '@/types/image';

interface IDragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  translateX: number;
  translateY: number;
  lastTranslateX: number;
  lastTranslateY: number;
  hasMoved: boolean;
}

export default defineComponent({
  name: 'ImageModal',

  components: {
    AppImage,
  },

  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    imageFilename: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      required: true,
    },
  },

  emits: ['close'],

  setup(props, { emit }) {
    const dialogRef = ref<HTMLDialogElement | null>(null);
    const previousActiveElement = ref<HTMLElement | null>(null);
    const imageRef = ref<InstanceType<typeof AppImage> | null>(null);
    const isZoomed = ref(false);
    const isDragging = ref(false);
    const dragState = ref<IDragState>({
      isDragging: false,
      startX: 0,
      startY: 0,
      translateX: 0,
      translateY: 0,
      lastTranslateX: 0,
      lastTranslateY: 0,
      hasMoved: false,
    });

    // Compute the transform style for the container
    const transformStyle = computed(() => {
      if (!isZoomed.value) {
        return {};
      }
      return {
        transform: `translate(${dragState.value.translateX}px, ${dragState.value.translateY}px)`,
      };
    });

    const lockScroll = (): void => {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    };

    const unlockScroll = (): void => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };

    const handleTabKey = (event: KeyboardEvent): void => {
      if (!dialogRef.value) return;

      const focusableElements = dialogRef.value.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          event.preventDefault();
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Tab') {
        handleTabKey(event);
      } else if (event.key === 'Escape') {
        handleClose();
      } else if (event.key === 'z' || event.key === 'Z') {
        // Toggle zoom with 'z' key
        toggleZoom();
      }
    };

    watch(
      () => props.isOpen,
      (newValue) => {
        if (newValue && dialogRef.value) {
          previousActiveElement.value = document.activeElement as HTMLElement;
          dialogRef.value.showModal();
          lockScroll();

          // Reset zoom state when opening
          isZoomed.value = false;
          resetDragState();

          // Focus the close button after opening
          const closeButton = dialogRef.value.querySelector('.image-modal__close');
          if (closeButton instanceof HTMLElement) {
            closeButton.focus();
          }
          console.log('ImageModal opened with full-size image:', props.imageFilename);
        } else if (dialogRef.value) {
          dialogRef.value.close();
          unlockScroll();
          // Restore focus to the previous element
          if (previousActiveElement.value) {
            previousActiveElement.value.focus();
          }
        }
      },
      { immediate: true }
    );

    const handleClose = (): void => {
      emit('close');
    };

    const handleBackdropClick = (event: MouseEvent): void => {
      if (event.target === event.currentTarget) {
        handleClose();
      }
    };

    const handleContainerClick = (event: MouseEvent): void => {
      // Only toggle zoom if we're not dragging and haven't moved
      if (!isDragging.value && !dragState.value.hasMoved) {
        toggleZoom();
      }
    };

    const startDrag = (event: MouseEvent | TouchEvent): void => {
      if (!isZoomed.value) {
        return;
      }

      event.preventDefault();
      isDragging.value = true;
      dragState.value.hasMoved = false;

      const { clientX, clientY } = event instanceof MouseEvent ? event : event.touches[0];
      dragState.value = {
        ...dragState.value,
        isDragging: true,
        startX: clientX - dragState.value.lastTranslateX,
        startY: clientY - dragState.value.lastTranslateY,
      };
    };

    const drag = (event: MouseEvent | TouchEvent): void => {
      if (!dragState.value.isDragging || !isZoomed.value) {
        return;
      }

      event.preventDefault();

      const { clientX, clientY } = event instanceof MouseEvent ? event : event.touches[0];
      dragState.value.translateX = clientX - dragState.value.startX;
      dragState.value.translateY = clientY - dragState.value.startY;

      // Check if we've moved more than a small threshold
      const distance = Math.sqrt(
        (dragState.value.translateX - dragState.value.lastTranslateX) ** 2 +
          (dragState.value.translateY - dragState.value.lastTranslateY) ** 2
      );

      if (distance > 5) {
        dragState.value.hasMoved = true;
      }
    };

    const stopDrag = (): void => {
      if (dragState.value.isDragging) {
        dragState.value.lastTranslateX = dragState.value.translateX;
        dragState.value.lastTranslateY = dragState.value.translateY;
      }
      dragState.value.isDragging = false;
      isDragging.value = false;
    };

    const resetDragState = (): void => {
      dragState.value = {
        isDragging: false,
        startX: 0,
        startY: 0,
        translateX: 0,
        translateY: 0,
        lastTranslateX: 0,
        lastTranslateY: 0,
        hasMoved: false,
      };
      isDragging.value = false;
    };

    const toggleZoom = (): void => {
      isZoomed.value = !isZoomed.value;
      if (!isZoomed.value) {
        // Reset transform when zooming out
        resetDragState();
      }
    };

    onUnmounted(() => {
      unlockScroll();
    });

    return {
      dialogRef,
      ImageSizeEnum,
      isZoomed,
      isDragging,
      handleClose,
      handleBackdropClick,
      handleKeyDown,
      toggleZoom,
      imageRef,
      handleContainerClick,
      startDrag,
      drag,
      stopDrag,
      transformStyle,
    };
  },
});
</script>

<style scoped>
.image-modal {
  position: fixed;
  inset: 0;
  width: 100dvw;
  height: 100dvh;
  margin: 0;
  padding: var(--spacing-xl);
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  box-sizing: border-box;
  overscroll-behavior: none;
  overflow: hidden;
}

.image-modal:not([open]) {
  display: none;
}

.image-modal::backdrop {
  background: var(--color-background);
  position: fixed;
  inset: 0;
  width: 100dvw;
  height: 100dvh;
  opacity: 0.98;
}

.image-modal__content {
  position: relative;
  max-width: min(90dvw, 120rem);
  max-height: 90dvh;
  margin: auto;
  background: transparent;
  padding: 0;
  overscroll-behavior: contain;
}

.image-modal__close {
  position: fixed;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: none;
  background: color-mix(in srgb, var(--color-text) 10%, transparent);
  color: var(--color-text);
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  backdrop-filter: blur(4px);
  transition: background-color 0.2s ease;
}

.image-modal__close:hover {
  background: color-mix(in srgb, var(--color-text) 20%, transparent);
}

.image-modal__image-container {
  position: relative;
  user-select: none;
  cursor: zoom-in;
  transition: transform 0.3s ease;
}

.image-modal__image-container--zoomed {
  cursor: grab;
}

.image-modal__image-container--dragging {
  cursor: grabbing;
}

.image-modal__image {
  max-width: 100%;
  max-height: 90dvh;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 0 1rem color-mix(in srgb, var(--color-text) 20%, transparent));
  transition: transform 0.3s ease;
}

.image-modal__image--zoomed {
  transform: scale(1.5);
}
</style> 