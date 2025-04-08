<!--
@component UserMenu
@description A dropdown menu component for user-related actions like profile access and logout.

@features
- Toggleable dropdown menu
- Profile navigation link
- Logout functionality
- Responsive design
- Keyboard navigation support
- Screen reader support

@example
<template>
  <UserMenu
    :user-name="currentUser.name"
    :is-open="menuOpen"
    :is-profile-active="isProfileRoute"
    @toggle="toggleMenu"
    @logout="handleLogout"
  />
</template>

@props
| Name            | Type    | Default | Description                                    |
|-----------------|---------|---------|------------------------------------------------|
| userName        | string  | -       | Display name of the current user              |
| isOpen         | boolean | false   | Controls the visibility of the dropdown menu   |
| isProfileActive | boolean | false   | Indicates if profile route is currently active |

@events
| Name   | Payload | Description                                |
|--------|---------|-------------------------------------------|
| toggle | void    | Emitted when menu button is clicked       |
| logout | void    | Emitted when logout button is clicked     |

@accessibility
- Uses semantic HTML elements (button, nav)
- Implements ARIA attributes for dropdown menu
- Supports keyboard navigation
- Provides screen reader announcements
-->

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import UserAvatar from '../atoms/UserAvatar.vue';
import DropdownMenu from './DropdownMenu.vue';

interface IUser {
  displayName: string;
  avatarUrl?: string;
}

const props = defineProps<{
  user: IUser;
  isOpen: boolean;
}>();

const emit = defineEmits<(e: 'toggle') => void>();

// Add logging for props changes
console.log('[UserMenu] Props updated:', {
  userName: props.user.displayName,
  isOpen: props.isOpen,
});

const router = useRouter();
const authStore = useAuthStore();

const userInitials = computed(() => {
  const initials = props.user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  console.log('[UserMenu] Generated initials:', initials);
  return initials;
});

const handleLogout = async () => {
  console.log('[UserMenu] Logout initiated');
  try {
    await authStore.logout();
    console.log('[UserMenu] Logout successful');
    router.push('/login');
  } catch (error) {
    console.error('[UserMenu] Logout failed:', error);
  }
};

// Add logging for menu toggle
const handleToggle = () => {
  console.log('[UserMenu] Toggle triggered, current isOpen:', props.isOpen);
  emit('toggle');
};
</script>

<template>
  <DropdownMenu :is-open="isOpen" @toggle="handleToggle">
    <template #trigger>
      <button 
        class="user-menu__trigger"
        :aria-label="`${user.displayName}'s menu`"
        @click="() => console.log('[UserMenu] Trigger button clicked')"
      >
        <UserAvatar
          :initials="userInitials"
          :avatar-url="user.avatarUrl"
          :alt="user.displayName"
          size="sm"
        />
      </button>
    </template>
    <template #menu>
      <nav class="user-menu__nav">
        <router-link 
          to="/profile" 
          class="user-menu__link"
          @click="handleToggle"
        >
          Profile
        </router-link>
        <router-link 
          to="/settings" 
          class="user-menu__link"
          @click="handleToggle"
        >
          Settings
        </router-link>
        <button 
          class="user-menu__link user-menu__link--logout"
          @click="handleLogout"
        >
          Logout
        </button>
      </nav>
    </template>
  </DropdownMenu>
</template>

<style scoped>
.user-menu__trigger {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.user-menu__nav {
  display: flex;
  flex-direction: column;
  min-width: 12rem;
}

.user-menu__link {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text);
  text-decoration: none;
  transition: background-color var(--transition-fast);
}

.user-menu__link:hover {
  background-color: var(--color-background-alt);
}

.user-menu__link--logout {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  color: var(--color-danger);
}
</style>
