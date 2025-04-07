<!-- BaseView.vue -->
<template>
    <div :class="['base-view', `base-view--${variant}`]">
      <header v-if="showHeader" class="base-view__header">
        <slot name="header">
          <h1 class="base-view__title">{{ title }}</h1>
        </slot>
      </header>
      
      <main class="base-view__content">
        <slot></slot>
      </main>
      
      <footer v-if="showFooter" class="base-view__footer">
        <slot name="footer"></slot>
      </footer>
    </div>
  </template>
  
  <script setup lang="ts">
import { computed } from 'vue';

interface IBaseViewProps {
  title?: string;
  variant?: 'default' | 'narrow' | 'wide' | 'full';
  showHeader?: boolean;
  showFooter?: boolean;
}

const props = withDefaults(defineProps<IBaseViewProps>(), {
  title: '',
  variant: 'default',
  showHeader: true,
  showFooter: false,
});
</script>
  
  <style scoped>
  .base-view {
    min-height: 100vh;
    background-color: var(--color-background);
    color: var(--color-text);
    display: flex;
    flex-direction: column;
  }
  
  .base-view--narrow .base-view__content {
    max-width: 45rem;
    margin: 0 auto;
    width: 100%;
    padding: var(--spacing-md);
  }
  
  .base-view--wide .base-view__content {
    max-width: 80rem;
    margin: 0 auto;
    width: 100%;
    padding: var(--spacing-md);
  }
  
  .base-view--full .base-view__content {
    width: 100%;
    padding: var(--spacing-md);
  }
  
  .base-view__header {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
  }
  
  .base-view__title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    margin: 0;
  }
  
  .base-view__content {
    flex: 1;
    padding: var(--spacing-md);
  }
  
  .base-view__footer {
    padding: var(--spacing-md);
    border-top: 1px solid var(--color-border);
  }
  </style>