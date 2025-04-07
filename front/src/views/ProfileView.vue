<!--
  @component ProfileView
  @description A page component that displays and allows editing of the user's profile information.
  
  @features
  - Displays user profile information (name, email, role)
  - Allows uploading and changing profile picture
  - Shows success/error messages for avatar upload
  - Responsive design for different screen sizes
  
  @accessibility
  - Uses semantic HTML elements
  - Proper heading hierarchy
  - Keyboard accessible file upload
  - Clear success/error messaging
  - Proper focus management
-->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import BaseView from '@/components/templates/BaseView.vue';
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue';
import AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';
import UserAvatar from '@/components/atoms/UserAvatar.vue';
import { UserRole } from '@/types/user';

// State
const authStore = useAuthStore();
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const avatarPreview = ref<string | null>(null);

// Computed
const user = computed(() => authStore.user);
const hasUser = computed<boolean>(() => user.value !== null);

const userLevel = computed((): string => {
  if (!user.value) return 'User';
  switch (user.value.role) {
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.EDITOR:
      return 'Content Author';
    default:
      return 'Regular User';
  }
});

// Methods
const handleAvatarChange = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  // Preview the image
  avatarPreview.value = URL.createObjectURL(file);

  // Upload the image
  const formData = new FormData();
  formData.append('avatar', file);

  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${API_BASE_URL}/v1/users/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update profile picture');
    }

    await authStore.fetchUserData(); // Refresh user data
    successMessage.value = 'Profile picture updated successfully';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
    avatarPreview.value = null;
  } finally {
    loading.value = false;
  }
};

const triggerFileInput = (): void => {
  fileInput.value?.click();
};

// Lifecycle hooks
onMounted(() => {
  if (!hasUser.value) {
    authStore.fetchUserData();
  }
});
</script>

<template>
  <BaseView 
    title="My Profile" 
    variant="narrow"
  >
    <template #header>
      <header class="profile-view__header">
        <h1 class="profile-view__title">My Profile</h1>
        <p class="profile-view__subtitle">Manage your account information and preferences</p>
      </header>
    </template>
    
    <!-- Loading state -->
    <LoadingSpinner 
      v-if="loading" 
      size="lg" 
      text="Updating profile..." 
    />
    
    <!-- Error state -->
    <section 
      v-else-if="error" 
      class="profile-view__error"
      aria-live="assertive"
    >
      <p class="profile-view__error-text">{{ error }}</p>
      <div class="profile-view__actions">
        <AppButton 
          @click="triggerFileInput" 
          :variant="ButtonVariantEnum.PRIMARY"
        >
          Try Again
        </AppButton>
      </div>
    </section>
    
    <!-- Empty state -->
    <section 
      v-else-if="!hasUser" 
      class="profile-view__empty"
    >
      <p class="profile-view__empty-text">No profile data available</p>
      <AppButton 
        @click="authStore.fetchUserData" 
        :variant="ButtonVariantEnum.SECONDARY"
      >
        Load Profile
      </AppButton>
    </section>
    
    <!-- Content -->
    <main 
      v-else 
      class="profile-view__content"
    >
      <!-- User info section -->
      <section class="profile-view__section">
        <h2 class="profile-view__section-title">Profile Information</h2>
        
        <div class="profile-view__avatar-container">
          <figure>
            <UserAvatar
              :src="user?.avatar?.filename"
              :alt="user?.firstName || 'User avatar'"
              size="lg"
              class="profile-view__avatar"
            />
            <figcaption class="visually-hidden">Profile picture</figcaption>
          </figure>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="profile-view__file-input"
            @change="handleAvatarChange"
            aria-label="Upload profile picture"
          />

          <AppButton
            @click="triggerFileInput"
            :disabled="loading"
            :variant="ButtonVariantEnum.SECONDARY"
            class="profile-view__avatar-button"
            data-test="change-profile-picture-button"
          >
            {{ loading ? 'Uploading...' : 'Change Profile Picture' }}
          </AppButton>
        </div>

        <!-- Success/Error messages -->
        <div v-if="successMessage" class="profile-view__message profile-view__message--success" role="status">
          {{ successMessage }}
        </div>
        <div v-if="error" class="profile-view__message profile-view__message--error" role="alert">
          {{ error }}
        </div>

        <!-- User details -->
        <dl class="profile-view__details">
          <div class="profile-view__detail-group">
            <dt class="profile-view__label">Name</dt>
            <dd class="profile-view__value">{{ user?.firstName }} {{ user?.lastName }}</dd>
          </div>

          <div class="profile-view__detail-group">
            <dt class="profile-view__label">Email</dt>
            <dd class="profile-view__value">{{ user?.email }}</dd>
          </div>

          <div class="profile-view__detail-group">
            <dt class="profile-view__label">User Level</dt>
            <dd class="profile-view__value">{{ userLevel }}</dd>
          </div>
        </dl>
      </section>
    </main>
  </BaseView>
</template>

<style scoped>
.profile-view__header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.profile-view__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.profile-view__subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.profile-view__error,
.profile-view__empty {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.profile-view__error-text,
.profile-view__empty-text {
  margin-bottom: var(--spacing-md);
}

.profile-view__error-text {
  color: var(--color-danger);
}

.profile-view__empty-text {
  color: var(--color-text-muted);
}

.profile-view__actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.profile-view__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.profile-view__section {
  background-color: var(--color-background-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.profile-view__section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.profile-view__avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.profile-view__avatar {
  margin-bottom: var(--spacing-sm);
}

.profile-view__file-input {
  display: none;
}

.profile-view__avatar-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.profile-view__message {
  text-align: center;
  margin: var(--spacing-md) 0;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
}

.profile-view__message--success {
  background-color: var(--color-success-light);
  color: var(--color-success);
}

.profile-view__message--error {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}

.profile-view__details {
  margin-top: var(--spacing-lg);
}

.profile-view__detail-group {
  margin-bottom: var(--spacing-md);
}

.profile-view__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
  display: block;
}

.profile-view__value {
  font-size: var(--font-size-base);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

/* Responsive styles */
@media (max-width: 640px) {
  .profile-view__section {
    padding: var(--spacing-md);
  }

  .profile-view__avatar {
    width: 6rem;
    height: 6rem;
  }
}
</style>
