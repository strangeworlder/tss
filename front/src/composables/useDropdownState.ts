import { ref } from 'vue';

// Create a symbol to ensure this is truly private
const STATE_KEY = Symbol('dropdownState');

// Create a global state object that persists across all instances
const globalState = {
  activeDropdownId: ref<string | null>(null),
};

export function useDropdownState() {
  const registerDropdown = (id: string): void => {
    console.log('[useDropdownState] Registering dropdown:', id);
    // If there's already an active dropdown, close it first
    if (globalState.activeDropdownId.value && globalState.activeDropdownId.value !== id) {
      console.log(
        '[useDropdownState] Closing previous dropdown:',
        globalState.activeDropdownId.value
      );
      // Emit a custom event to notify the previous dropdown to close
      window.dispatchEvent(
        new CustomEvent('close-dropdown', {
          detail: { id: globalState.activeDropdownId.value },
        })
      );
    }
    globalState.activeDropdownId.value = id;
  };

  const unregisterDropdown = (id: string): void => {
    console.log('[useDropdownState] Unregistering dropdown:', id);
    if (globalState.activeDropdownId.value === id) {
      globalState.activeDropdownId.value = null;
    }
  };

  const isDropdownActive = (id: string): boolean => {
    return globalState.activeDropdownId.value === id;
  };

  const closeAllDropdowns = (): void => {
    console.log('[useDropdownState] Closing all dropdowns');
    if (globalState.activeDropdownId.value) {
      // Emit a custom event to notify the active dropdown to close
      window.dispatchEvent(
        new CustomEvent('close-dropdown', {
          detail: { id: globalState.activeDropdownId.value },
        })
      );
      globalState.activeDropdownId.value = null;
    }
  };

  return {
    registerDropdown,
    unregisterDropdown,
    isDropdownActive,
    closeAllDropdowns,
  };
}
