<!--
  DropdownMenu Component
  A reusable dropdown menu component that can be used for various dropdown menus.

  Features:
  - Toggleable dropdown menu
  - Customizable trigger button
  - Customizable menu items
  - Responsive design
  - Keyboard navigation support
  - Screen reader support

  Usage:
  ```vue
  <template>
    <DropdownMenu
      :is-open="isOpen"
      @toggle="toggleMenu"
    >
      <template #trigger>
        <button>Open Menu</button>
      </template>
      <template #menu>
        <button @click="action1">Action 1</button>
        <button @click="action2">Action 2</button>
      </template>
    </DropdownMenu>
  </template>
  ```

  Props:
  | Name    | Type    | Default | Description                                    |
  |---------|---------|---------|------------------------------------------------|
  | isOpen  | boolean | false   | Controls the visibility of the dropdown menu   |

  Events:
  | Name   | Payload | Description                                |
  |--------|---------|-------------------------------------------|
  | toggle | void    | Emitted when menu button is clicked       |

  Slots:
  | Name    | Description                                    |
  |---------|------------------------------------------------|
  | trigger | The button that toggles the dropdown menu   |
  | menu    | The content of the dropdown menu              |

  Accessibility:
  - Uses semantic HTML elements
  - Implements ARIA attributes for dropdown menu
  - Supports keyboard navigation
  - Provides screen reader announcements
-->

<template>
  <div class="dropdown-menu">
    <!-- Trigger button -->
    <div 
      class="dropdown-menu__trigger" 
      role="button"
      :aria-expanded="isOpen"
      :aria-controls="menuId"
      tabindex="0"
      @click="onTriggerClick"
      @keydown="onKeyDown"
    >
      <slot name="trigger"></slot>
    </div>

    <!-- Menu content -->
    <div 
      v-if="isOpen"
      :id="menuId"
      class="dropdown-menu__content" 
      role="menu"
    >
      <slot name="menu"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useDropdownState } from '@/composables/useDropdownState';

// Props interface
interface IDropdownMenuProps {
  isOpen: boolean;
}

// Events interface
type IDropdownMenuEmits = (e: 'toggle') => void;

const props = defineProps<IDropdownMenuProps>();
const emit = defineEmits<IDropdownMenuEmits>();

// Generate unique ID for ARIA attributes
const menuId = computed(() => `dropdown-menu-${Math.random().toString(36).substr(2, 9)}`);

// Track if component is mounted for cleanup
const isMounted = ref(false);

// Get dropdown state management
const { registerDropdown, unregisterDropdown, isDropdownActive, closeAllDropdowns } =
  useDropdownState();

// Handle close-dropdown event
const handleCloseDropdown = (event: CustomEvent<{ id: string }>): void => {
  if (event.detail.id === menuId.value && props.isOpen) {
    console.log('[DropdownMenu] Received close-dropdown event');
    emit('toggle');
  }
};

// Watch for changes in isOpen prop
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      registerDropdown(menuId.value);
    } else {
      unregisterDropdown(menuId.value);
    }
  }
);

// Handle trigger button click
const onTriggerClick = (event: MouseEvent): void => {
  console.log('[DropdownMenu] Trigger clicked');
  event.preventDefault();
  event.stopPropagation();

  if (props.isOpen) {
    unregisterDropdown(menuId.value);
  } else {
    closeAllDropdowns(); // Close any other open dropdowns
    registerDropdown(menuId.value);
  }

  emit('toggle');
};

// Handle keyboard navigation
const onKeyDown = (event: KeyboardEvent): void => {
  console.log('[DropdownMenu] Key pressed:', event.key);

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (!props.isOpen) {
        closeAllDropdowns(); // Close any other open dropdowns
        registerDropdown(menuId.value);
      }
      emit('toggle');
      break;
    case 'Escape':
      if (props.isOpen) {
        event.preventDefault();
        unregisterDropdown(menuId.value);
        emit('toggle');
      }
      break;
  }
};

// Handle clicks outside the menu
const onDocumentClick = (event: MouseEvent): void => {
  if (!isMounted.value) return;

  const target = event.target as HTMLElement;
  const isClickInside = target.closest('.dropdown-menu');

  console.log('[DropdownMenu] Document click:', {
    isClickInside,
    isOpen: props.isOpen,
  });

  if (!isClickInside && props.isOpen) {
    console.log('[DropdownMenu] Click outside detected, closing menu');
    unregisterDropdown(menuId.value);
    emit('toggle');
  }
};

// Lifecycle hooks
onMounted(() => {
  console.log('[DropdownMenu] Component mounted');
  isMounted.value = true;
  document.addEventListener('click', onDocumentClick);
  window.addEventListener('close-dropdown', handleCloseDropdown as EventListener);
});

onUnmounted(() => {
  console.log('[DropdownMenu] Component unmounted');
  isMounted.value = false;
  document.removeEventListener('click', onDocumentClick);
  window.removeEventListener('close-dropdown', handleCloseDropdown as EventListener);
  unregisterDropdown(menuId.value);
});
</script>

<style scoped>
.dropdown-menu {
  position: relative;
}

.dropdown-menu__trigger {
  cursor: pointer;
}

.dropdown-menu__content {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--color-background-card);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  min-width: 12.5rem;
  z-index: var(--z-index-dropdown);
}

@media (max-width: 48rem) {
  .dropdown-menu__content {
    position: static;
    box-shadow: none;
    background-color: var(--color-background-alt);
    margin-top: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
  }
}
</style> 