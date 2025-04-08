/**
 * TagPill component props interface
 */
interface TagPillProps {
  tag: string;
  clickable?: boolean;
  variant?: 'primary' | 'secondary';
}

/**
 * Creates a default set of props for the TagPill component
 * @param overrides - Props to override the defaults
 * @returns The props for the TagPill component
 */
export function createTagPillProps(overrides: Partial<TagPillProps> = {}) {
  return {
    tag: 'test-tag',
    clickable: true,
    ...overrides,
  };
}

/**
 * Mock data for testing the TagPill component
 */
export const mockTagPills = {
  default: createTagPillProps(),
  nonClickable: createTagPillProps({
    clickable: false,
  }),
  withHyphens: createTagPillProps({
    tag: 'test-tag-with-hyphens',
  }),
  primary: createTagPillProps({
    tag: 'primary-tag',
    variant: 'primary',
  }),
  secondary: createTagPillProps({
    tag: 'secondary-tag',
    variant: 'secondary',
  }),
};
