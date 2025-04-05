<template>
  <div class="avatar" :class="[`avatar--${size}`]">
    <img
      v-if="src && !hasError"
      :src="imageUrl"
      :alt="alt"
      class="avatar__image"
      @error="handleImageError"
    />
    <div v-else class="avatar__placeholder">
      {{ initials }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getImageUrl } from '@/api/imageService';
import { ImageSize, ImageFormat } from '@/types/image';

const props = defineProps<{
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
}>();

const hasError = ref(false);

// Map component size to ImageSize
const getImageSize = (size?: string): ImageSize => {
  switch (size) {
    case 'sm':
      return ImageSize.THUMBNAIL;
    case 'md':
      return ImageSize.MEDIUM;
    case 'lg':
      return ImageSize.FULL;
    default:
      return ImageSize.THUMBNAIL;
  }
};

const imageUrl = computed(() => {
  if (hasError.value || !props.src) return '';
  return getImageUrl(
    props.src,
    getImageSize(props.size),
    ImageFormat.WEBP // Prefer WebP for better compression
  );
});

const initials = computed(() => {
  if (!props.name) return '';
  return props.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();
});

const handleImageError = () => {
  hasError.value = true;
};
</script>

<style scoped>
.avatar {
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.avatar--sm {
  width: var(--avatar-size-sm);
  height: var(--avatar-size-sm);
  font-size: var(--font-size-xs);
}

.avatar--md {
  width: var(--avatar-size-md);
  height: var(--avatar-size-md);
  font-size: var(--font-size-sm);
}

.avatar--lg {
  width: var(--avatar-size-lg);
  height: var(--avatar-size-lg);
  font-size: var(--font-size-base);
}

.avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 