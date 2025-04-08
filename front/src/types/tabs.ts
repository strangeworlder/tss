/**
 * Tab-related type definitions
 */

export interface TabItem {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  badge?: string | number;
  content?: string;
}
