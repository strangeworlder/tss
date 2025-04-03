<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

interface Props {
  tag: string;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true
});

const router = useRouter();

const navigateToTag = () => {
  if (props.clickable) {
    router.push(`/blog/tag/${props.tag}`);
  }
};

// Make sure tag is displayed properly
const displayTag = computed(() => {
  return props.tag ? props.tag.replace(/-/g, ' ') : '';
});
</script>

<template>
  <div 
    class="tag-pill" 
    :class="{ 'tag-pill--clickable': clickable }"
    @click="navigateToTag"
  >
    {{ displayTag }}
  </div>
</template>

<style scoped>
.tag-pill {
  display: inline-block;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
  margin-right: var(--spacing-1);
  margin-bottom: var(--spacing-1);
  cursor: pointer;
  font-family: var(--font-family-base);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  padding: var(--spacing-1) var(--spacing-4);
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
  background-color: var(--color-highlight-1);
  color: var(--color-background);
  border-color: var(--color-highlight-1);
}

.tag-pill--primary:hover {
  background-color: var(--color-highlight-2);
  opacity: 0.9;
}

.tag-pill--secondary {
  background-color: var(--color-background-mute);
  color: var(--color-text);
}

.tag-pill--small {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
}

.tag-pill--medium {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
}

.tag-pill--large {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
}
</style> 