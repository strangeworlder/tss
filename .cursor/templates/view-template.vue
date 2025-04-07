<!--
@component ViewName
@description Brief description of the view's purpose and functionality.

@features
- Feature 1: Description of the first feature
- Feature 2: Description of the second feature
- Feature 3: Description of the third feature
- Feature 4: Description of the fourth feature

@accessibility
- Uses semantic HTML elements
- Proper heading hierarchy
- Keyboard navigation support
- Clear error and success messaging
-->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BaseView from '@/components/templates/BaseView.vue';
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue';
import AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';
import type { IData } from '@/types/data';

// State
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const data = ref<IData | null>(null);

// Computed
const hasData = computed<boolean>(() => data.value !== null);

// Methods
const fetchData = async (): Promise<void> => {
  loading.value = true;
  error.value = null;

  try {
    // API call or data fetching logic here
    // data.value = await apiService.getData();
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = err instanceof Error 
      ? err.message 
      : 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchData();
});
</script>

<template>
  <BaseView 
    title="View Title" 
    variant="narrow"
  >
    <template #header>
      <div class="view-name__header">
        <h1 class="view-name__title">View Title</h1>
        <p class="view-name__subtitle">Optional subtitle or description</p>
      </div>
    </template>
    
    <!-- Loading state -->
    <LoadingSpinner 
      v-if="loading" 
      size="lg" 
      text="Loading data..." 
    />
    
    <!-- Error state -->
    <div 
      v-else-if="error" 
      class="view-name__error"
    >
      <p class="view-name__error-text">{{ error }}</p>
      <div class="view-name__actions">
        <AppButton 
          @click="fetchData" 
          :variant="ButtonVariantEnum.PRIMARY"
        >
          Try Again
        </AppButton>
      </div>
    </div>
    
    <!-- Empty state -->
    <div 
      v-else-if="!hasData" 
      class="view-name__empty"
    >
      <p class="view-name__empty-text">No data available</p>
      <AppButton 
        @click="fetchData" 
        :variant="ButtonVariantEnum.SECONDARY"
      >
        Refresh
      </AppButton>
    </div>
    
    <!-- Content -->
    <div 
      v-else 
      class="view-name__content"
    >
      <!-- Main content here -->
      <section class="view-name__section">
        <h2 class="view-name__section-title">Section Title</h2>
        <div class="view-name__section-content">
          <!-- Section content here -->
        </div>
      </section>
    </div>
  </BaseView>
</template>

<style scoped>
.view-name__header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.view-name__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.view-name__subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.view-name__error,
.view-name__empty {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.view-name__error-text,
.view-name__empty-text {
  margin-bottom: var(--spacing-md);
}

.view-name__error-text {
  color: var(--color-danger);
}

.view-name__empty-text {
  color: var(--color-text-muted);
}

.view-name__actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.view-name__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.view-name__section {
  background-color: var(--color-background-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.view-name__section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.view-name__section-content {
  color: var(--color-text);
}

/* Responsive styles */
@media (min-width: 768px) {
  .view-name__header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .view-name__subtitle {
    max-width: 60%;
  }
}
</style> 