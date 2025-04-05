<script setup lang="ts">
import Button from '@/components/atoms/Button.vue'

defineProps<{
  to: string
}>()
</script>

<template>
  <Button :to="to" variant="primary"> Read More </Button>
</template>

<style scoped>
/* Remove custom styles since we're using the Button atom */
</style>
