<script setup lang="ts">
interface Props {
  text: string;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'medium'
});
</script>

<template>
  <span class="tag-pill" :class="[`tag-pill--${variant}`, `tag-pill--${size}`]">
    {{ text }}
  </span>
</template>

<style scoped>
.tag-pill {
  display: inline-block;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  transition: all 0.2s ease-in-out;
  margin-right: var(--spacing-1);
  margin-bottom: var(--spacing-1);
  cursor: pointer;
}

.tag-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  background-color: var(--color-background-mute);
}

.tag-pill--default {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.tag-pill--primary {
  background-color: var(--vt-c-indigo);
  color: var(--vt-c-white);
  border-color: var(--vt-c-indigo);
}

.tag-pill--primary:hover {
  background-color: var(--vt-c-indigo);
  opacity: 0.9;
}

.tag-pill--secondary {
  background-color: var(--color-background-mute);
  color: var(--color-text);
}

.tag-pill--small {
  padding: 0.15rem 0.5rem;
  font-size: 0.7rem;
}

.tag-pill--medium {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}

.tag-pill--large {
  padding: 0.35rem 1rem;
  font-size: 0.9rem;
}
</style> 