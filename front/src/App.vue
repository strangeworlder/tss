<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <div class="container app-header__container">
      <h1 class="app-header__title">Vue Blog</h1>
      <nav class="app-header__nav">
        <ul class="app-header__nav-list">
          <li><RouterLink to="/" class="app-header__nav-link">Home</RouterLink></li>
          <li><RouterLink to="/blog" class="app-header__nav-link">Blog</RouterLink></li>
          <li><RouterLink to="/about" class="app-header__nav-link">About</RouterLink></li>
          <li><RouterLink to="/auth" class="app-header__nav-link">Login / Register</RouterLink></li>
        </ul>
      </nav>
    </div>
  </header>

  <main class="container app-main">
    <RouterView />
  </main>

  <footer class="app-footer">
    <div class="container app-footer__container">
      <p>&copy; {{ new Date().getFullYear() }} Vue Blog. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-header {
  background-color: var(--color-gray-800);
  color: var(--color-white);
  padding: var(--spacing-4);
  line-height: 1.5;
  max-height: 100vh;
}

.app-header__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header__title {
  font-size: 1.5rem;
  font-weight: bold;
}

.app-header__nav-list {
  display: flex;
}

.app-header__nav-list li {
  margin-left: var(--spacing-4);
}

.app-header__nav-list li:first-child {
  margin-left: 0;
}

.app-header__nav-link {
  color: var(--color-white);
}

.app-header__nav-link:hover {
  color: var(--color-gray-300);
}

.app-main {
  padding-top: var(--spacing-8);
  padding-bottom: var(--spacing-8);
}

.app-footer {
  background-color: var(--color-gray-800);
  color: var(--color-white);
  padding: var(--spacing-4);
  margin-top: var(--spacing-8);
}

.app-footer__container {
  text-align: center;
}

@media (min-width: 1024px) {
  .app-header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .app-header__nav {
    text-align: left;
    font-size: 1rem;
    padding: 1rem 0;
  }
}
</style>
