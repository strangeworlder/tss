<template>
  <div class="blog-hero">
    <app-image 
      :filename="heroImage" 
      size="full" 
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
import AppImage from '@/components/common/AppImage.vue';

export default defineComponent({
  name: 'BlogHero',
  
  components: {
    AppImage
  },
  
  props: {
    heroImage: {
      type: String,
      required: true
    },
    altText: {
      type: String,
      default: 'Blog hero image'
    }
  }
});
</script>

<style scoped>
.blog-hero {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
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
  padding: 2rem;
  color: var(--color-white);
  background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6));
}
</style> 