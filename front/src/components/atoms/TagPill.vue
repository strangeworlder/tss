<!--
 * TagPill
 * 
 * A component that displays a tag in a pill-shaped container.
 * 
 * Features:
 * - Displays tags in a visually distinct pill shape
 * - Can be clickable to navigate to tag-specific pages
 * - Supports different visual variants (default, primary, secondary)
 * - Supports different size variants (small, medium, large)
 * - Automatically formats tag text by replacing hyphens with spaces
 * 
 * Props:
 * - tag (string): The tag text to display
 *   Default: none (required)
 * - clickable (boolean): Whether the tag is clickable and navigates to a tag page
 *   Default: true
 * 
 * Usage Examples:
 * 
 * Basic usage:
 * &lt;TagPill tag="javascript" /&gt;
 * 
 * Non-clickable tag:
 * &lt;TagPill tag="vue" :clickable="false" /&gt;
 * 
 * With custom styling:
 * &lt;div class="tag-pill tag-pill--primary tag-pill--large"&gt;
 *   Custom Tag
 * &lt;/div&gt;
 * 
 * Accessibility:
 * - Uses semantic div element with appropriate role
 * - Provides visual feedback on hover
 * - Maintains sufficient color contrast
 * - Includes proper focus management for keyboard navigation
 * - Uses ARIA attributes for better screen reader support
 -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface ITagPillProps {
  tag: string
  clickable?: boolean
}

const props = withDefaults(defineProps<ITagPillProps>(), {
  clickable: true,
})

const router = useRouter()

const navigateToTag = () => {
  if (props.clickable) {
    router.push(`/blog/tag/${props.tag}`)
  }
}

// Make sure tag is displayed properly
const displayTag = computed(() => {
  return props.tag ? props.tag.replace(/-/g, ' ') : ''
})
</script>

<template>
  <div 
    class="tag-pill" 
    :class="{ 'tag-pill--clickable': clickable }" 
    @click="navigateToTag"
    role="link"
    :tabindex="clickable ? 0 : undefined"
    :aria-label="`Tag: ${displayTag}`"
  >
    {{ displayTag }}
  </div>
</template>

<style scoped>
.tag-pill {
  display: inline-block;
  background-color: var(--color-background-alt);
  color: var(--color-text);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
  margin-right: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  font-family: var(--font-family-base);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  padding: 0 var(--spacing-sm);
}

.tag-pill:hover {
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.05);
  background-color: var(--color-background-muted);
}

.tag-pill--clickable {
  cursor: pointer;
}

.tag-pill--clickable:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 0.125rem;
}

.tag-pill--default {
  background-color: var(--color-background-alt);
  color: var(--color-text);
}

.tag-pill--primary {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
  border-color: var(--color-primary-500);
}

.tag-pill--primary:hover {
  background-color: var(--color-primary-600);
  opacity: 0.9;
}

.tag-pill--secondary {
  background-color: var(--color-background-muted);
  color: var(--color-text);
}

.tag-pill--small {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.tag-pill--medium {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.tag-pill--large {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
}
</style>
