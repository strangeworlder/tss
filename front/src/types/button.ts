/**
 * Enum for button variants
 */
export enum ButtonVariantEnum {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
  TEXT = 'text',
}

export interface IButtonProps {
  variant?: ButtonVariantEnum;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'small' | 'medium' | 'large';
  /**
   * If provided, renders as a router-link with this destination
   */
  to?: string;
  /**
   * Accessible label for the button (only used when no content is provided)
   */
  ariaLabel?: string;
}
