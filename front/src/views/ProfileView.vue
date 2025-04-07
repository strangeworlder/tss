<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import Button from '@/components/atoms/Button.vue';
import { ButtonVariantEnum } from '@/types/button';
import AppImage from '@/components/atoms/AppImage.vue';
import { ImageSizeEnum } from '@/types/image';

const authStore = useAuthStore();
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const avatarPreview = ref<string | null>(null);

const user = computed(() => authStore.user);

const userLevel = computed(() => {
  if (!user.value) return 'User';
  switch (user.value.role) {
    case 'admin':
      return 'Administrator';
    case 'author':
      return 'Content Author';
    default:
      return 'Regular User';
  }
});

const handleAvatarChange = async (event: Event) => {
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

    const data = await response.json();
    await authStore.fetchUserData(); // Refresh user data
    successMessage.value = 'Profile picture updated successfully';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
    avatarPreview.value = null;
  } finally {
    loading.value = false;
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};
</script>

<template>
  <div class="profile-view">
    <div class="profile-view__container">
      <h1 class="profile-view__title">My Profile</h1>

      <!-- User info section -->
      <div class="profile-view__section">
        <div class="profile-view__avatar-container">
          <div class="profile-view__avatar">
            <AppImage
              v-if="user?.avatar?.filename && !avatarPreview"
              :filename="user.avatar.filename"
              :alt="user.avatar.altText || user.firstName"
              :size="ImageSizeEnum.MEDIUM"
              class="profile-view__avatar-img"
            />
            <img
              v-else-if="avatarPreview"
              :src="avatarPreview"
              :alt="user?.firstName"
              class="profile-view__avatar-img"
            />
            <div v-else class="profile-view__avatar-placeholder">
              {{ user?.firstName?.[0]?.toUpperCase() }}
            </div>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="profile-view__file-input"
            @change="handleAvatarChange"
          />

          <Button 
            @click="triggerFileInput" 
            :disabled="loading" 
            :variant="ButtonVariantEnum.SECONDARY"
            class="profile-view__avatar-button"
          >
            {{ loading ? 'Uploading...' : 'Change Profile Picture' }}
          </Button>
        </div>

        <!-- Success/Error messages -->
        <p v-if="successMessage" class="profile-view__message profile-view__message--success">
          {{ successMessage }}
        </p>
        <p v-if="error" class="profile-view__message profile-view__message--error">
          {{ error }}
        </p>

        <!-- User details -->
        <div class="profile-view__details">
          <div class="profile-view__detail-group">
            <label class="profile-view__label">Name</label>
            <p class="profile-view__value">{{ user?.firstName }} {{ user?.lastName }}</p>
          </div>

          <div class="profile-view__detail-group">
            <label class="profile-view__label">Email</label>
            <p class="profile-view__value">{{ user?.email }}</p>
          </div>

          <div class="profile-view__detail-group">
            <label class="profile-view__label">User Level</label>
            <p class="profile-view__value">{{ userLevel }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  padding: var(--spacing-8) var(--spacing-4);
  min-height: 100vh;
  background-color: var(--color-background);
}

.profile-view__container {
  max-width: 720px;
  margin: 0 auto;
}

.profile-view__title {
  font-size: var(--font-size-2xl);
  color: var(--color-heading);
  margin-bottom: var(--spacing-8);
  font-weight: var(--font-weight-bold);
}

.profile-view__section {
  background-color: var(--color-background-soft);
  border-radius: var(--border-radius);
  padding: var(--spacing-6);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-view__avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.profile-view__avatar {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: var(--spacing-4);
  background-color: var(--color-background-mute);
}

.profile-view__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-view__avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  color: var(--color-text);
  background-color: var(--color-background-mute);
}

.profile-view__file-input {
  display: none;
}

.profile-view__avatar-button {
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--color-heading);
  color: var(--color-background);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: background-color var(--transition-fast);
}

.profile-view__avatar-button:hover:not(:disabled) {
  background-color: var(--color-text);
}

.profile-view__avatar-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.profile-view__message {
  text-align: center;
  margin: var(--spacing-4) 0;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius);
}

.profile-view__message--success {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.profile-view__message--error {
  background-color: var(--color-error-bg);
  color: var(--color-error);
}

.profile-view__details {
  margin-top: var(--spacing-6);
}

.profile-view__detail-group {
  margin-bottom: var(--spacing-4);
}

.profile-view__label {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  margin-bottom: var(--spacing-1);
  display: block;
}

.profile-view__value {
  font-size: var(--font-size-base);
  color: var(--color-heading);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 640px) {
  .profile-view {
    padding: var(--spacing-4) var(--spacing-2);
  }

  .profile-view__section {
    padding: var(--spacing-4);
  }

  .profile-view__avatar {
    width: 96px;
    height: 96px;
  }
}
</style>
