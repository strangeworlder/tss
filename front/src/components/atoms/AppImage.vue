<template>
  <img
    :src="imageUrl"
    :alt="alt"
    :class="className"
    @error="handleImageError"
  />
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { getImageUrl } from '@/api/imageService';
import { ImageSize } from '@/types/image';

export default defineComponent({
  name: 'AppImage',
  
  props: {
    filename: {
      type: String,
      required: true
    },
    size: {
      type: String as () => ImageSize,
      default: ImageSize.FULL,
      validator: (value: string) => {
        return ['thumbnail', 'medium', 'full'].includes(value);
      }
    },
    alt: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: ''
    },
    fallback: {
      type: String,
      default: '/images/placeholder.webp'
    }
  },
  
  setup(props) {
    const hasError = ref(false);
    const imageUrl = computed(() => {
      if (hasError.value) {
        return props.fallback;
      }
      return getImageUrl(props.filename, props.size as ImageSize);
    });
    
    const handleImageError = () => {
      hasError.value = true;
    };
    
    return {
      imageUrl,
      handleImageError
    };
  }
});
</script> 