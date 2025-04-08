/**
 * useDocumentTitle composable
 *
 * A composable for managing document titles with best practices for SEO and accessibility.
 * - Puts the page-specific content first, followed by the site name
 * - Uses a consistent format across all pages
 * - Updates document.title reactively
 * - Announces title changes to screen readers when appropriate
 */
import { ref, watch } from 'vue';

// Site name to be used across all pages
const siteName = 'The Slow';

// Default title format: Page Title | Site Name
const formatTitle = (pageTitle: string): string => {
  if (!pageTitle) return siteName;
  return `${pageTitle} | ${siteName}`;
};

// Create a reactive title that will be used across the app
const title = ref<string>(siteName);

/**
 * Set the document title with proper format
 * @param pageTitle - The page-specific part of the title
 * @param announceToScreenReader - Whether to announce the title change to screen readers
 */
export function useDocumentTitle(pageTitle?: string, announceToScreenReader = false) {
  if (pageTitle) {
    title.value = pageTitle;
  }

  // Update document title when the reactive title changes
  watch(
    title,
    (newTitle) => {
      // Update the document title with proper format
      document.title = formatTitle(newTitle);

      // If requested, announce title change to screen readers
      if (announceToScreenReader) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.classList.add('sr-only'); // Screen reader only
        announcement.textContent = `Page changed to ${newTitle}`;
        document.body.appendChild(announcement);

        // Remove the announcement after it's been read
        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
      }
    },
    { immediate: true }
  );

  return {
    // Allow changing the title programmatically
    setTitle: (newTitle: string) => {
      title.value = newTitle;
    },
    // Get the current title
    title,
  };
}
