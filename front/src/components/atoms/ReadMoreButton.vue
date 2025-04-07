<!--
 * ReadMoreButton
 * 
 * A button component that links to a detailed view of content.
 * 
 * Features:
 * - Links to a detailed view using the provided route
 * - Uses the primary button variant for emphasis
 * - Simple and reusable component
 * 
 * Props:
 * - to (string): The route to navigate to when clicked
 *   Default: none (required)
 * 
 * Usage Examples:
 * 
 * Basic usage:
 * &lt;ReadMoreButton to="/blog/post-1" /&gt;
 * 
 * With custom text:
 * &lt;Button :to="'/blog/post-1'" :variant="ButtonVariantEnum.PRIMARY"&gt;
 *   Read Full Article
 * &lt;/Button&gt;
 * 
 * Accessibility:
 * - Uses semantic button element via Button component
 * - Inherits accessibility features from Button component
 -->
<script setup lang="ts">
import Button from '@/components/atoms/Button.vue'
import { ButtonVariantEnum } from '@/types/button'

interface IReadMoreButtonProps {
  to: string
}

defineProps<IReadMoreButtonProps>()
</script>

<template>
  <Button :to="to" :variant="ButtonVariantEnum.PRIMARY"> Read More </Button>
</template>

<style scoped>
/* Remove custom styles since we're using the Button atom */
</style>
