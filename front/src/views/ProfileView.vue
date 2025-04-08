<!--
  @component ProfileView
  @description A page component that displays and allows editing of the user's profile information.
  
  @features
  - Displays user profile information (name, email, role)
  - Allows uploading and changing profile picture
  - Shows success/error messages for avatar upload
  - Responsive design for different screen sizes
  - Theme preferences management
  
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
import { useThemeStore } from '@/stores/themeStore';
import BaseView from '@/components/templates/BaseView.vue';
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue';
import AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';
import UserAvatar from '@/components/atoms/UserAvatar.vue';
import { UserRole } from '@/types/user';
import ThemeToggle from '@/components/molecules/ThemeToggle.vue';

// State
const authStore = useAuthStore();
const themeStore = useThemeStore();
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const avatarPreview = ref<string | null>(null);

// Computed
const user = computed(() => authStore.user);
const hasUser = computed<boolean>(() => user.value !== null);
const currentTheme = computed(() => themeStore.currentTheme);
const isDarkMode = computed(() => themeStore.isDarkMode);

const userDisplayName = computed((): string => {
  if (!user.value) return '';
  return `${user.value.firstName} ${user.value.lastName}`;
});

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
  if (hasUser.value) {
    authStore.fetchUserData();
  }
});
</script>

<template>
  <BaseView>
    <div v-if="loading" class="profile__loading">
      <LoadingSpinner />
    </div>

    <div v-else-if="!hasUser" class="profile__error">
      <h2>Error</h2>
      <p>Unable to load profile information. Please try again later.</p>
    </div>

    <div v-else class="profile">
      <section class="profile__header">
        <h1>Profile</h1>
        <div class="profile__avatar">
          <UserAvatar 
            :src="user?.avatar?.filename" 
            :alt="userDisplayName || 'User avatar'"
            size="lg"
          />
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="profile__file-input"
            @change="handleAvatarChange"
          />
          <AppButton
            :variant="ButtonVariantEnum.SECONDARY"
            @click="triggerFileInput"
          >
            Change Avatar
          </AppButton>
        </div>
      </section>

      <section class="profile__info">
        <h2>Account Information</h2>
        <div class="profile__field">
          <label>Name</label>
          <p>{{ userDisplayName }}</p>
        </div>
        <div class="profile__field">
          <label>Email</label>
          <p>{{ user?.email }}</p>
        </div>
        <div class="profile__field">
          <label>Role</label>
          <p>{{ userLevel }}</p>
        </div>
      </section>

      <section class="profile__preferences">
        <h2>Theme Preferences</h2>
        <div class="profile__field">
          <label>Current Theme</label>
          <p>{{ currentTheme }}</p>
        </div>
        <div class="profile__field">
          <label>Color Mode</label>
          <p>{{ isDarkMode ? 'Dark' : 'Light' }}</p>
        </div>
        <div class="profile__theme-toggle">
          <ThemeToggle />
        </div>
      </section>

      <div v-if="error" class="profile__error">
        <p>{{ error }}</p>
      </div>

      <div v-if="successMessage" class="profile__success">
        <p>{{ successMessage }}</p>
      </div>
    </div>
  </BaseView>
</template>

<style scoped>
.profile {
  max-width: 48rem;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.profile__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.profile__avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.profile__file-input {
  display: none;
}

.profile__info,
.profile__preferences {
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.profile__field {
  margin-bottom: var(--spacing-md);
}

.profile__field label {
  display: block;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-secondary);
}

.profile__field p {
  margin: 0;
  color: var(--color-text);
}

.profile__theme-toggle {
  margin-top: var(--spacing-md);
}

.profile__error,
.profile__success {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
}

.profile__error {
  background-color: var(--color-danger);
  color: var(--color-text);
}

.profile__success {
  background-color: var(--color-success);
  color: var(--color-text);
}

.profile__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 20rem;
}

@media (max-width: 768px) {
  .profile {
    padding: var(--spacing-md);
  }

  .profile__info,
  .profile__preferences {
    padding: var(--spacing-md);
  }
}
</style>
