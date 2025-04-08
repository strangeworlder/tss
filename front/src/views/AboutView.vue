<!--
  AboutView Component
  A view component that displays the about page content.

  Features:
  - Responsive layout using semantic spacing
  - Semantic HTML structure
  - Accessible heading hierarchy
  - Proper viewport height handling

  Usage:
  ```vue
  <template>
    <AboutView />
  </template>
  ```

  Accessibility:
  - Uses semantic heading structure
  - Content is properly spaced for readability
  - Maintains proper color contrast using semantic variables
-->

<script setup lang="ts">
// Component logic can be added here when needed
</script>

<template>
  <main class="about">
    <div class="about__container">
      <h1 class="about__title">This is an about page</h1>
      <!-- Additional content can be added here -->
    </div>
  </main>
</template>

<style scoped>
.about {
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
}

.about__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  min-height: inherit;
}

.about__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
}

/* Responsive design using our standard breakpoints */
@media (min-width: 64rem) { /* 1024px / 16px = 64rem */
  .about__container {
    padding: var(--spacing-xl);
  }
}
</style>
