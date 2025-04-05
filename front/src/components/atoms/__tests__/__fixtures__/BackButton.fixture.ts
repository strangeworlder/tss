/**
 * Creates test props for the BackButton component
 * @param overrides - Properties to override defaults
 * @returns Object with BackButton props
 */
export const createBackButtonProps = (overrides = {}) => ({
  text: 'Back',
  to: '/',
  ...overrides
})

/**
 * BackButton test cases
 */
export const mockBackButtons = {
  default: {
    text: 'Back',
    to: '/'
  },
  customText: {
    text: 'Return to Home',
    to: '/'
  },
  customPath: {
    text: 'Back',
    to: '/dashboard'
  },
  customBoth: {
    text: 'Go to Profile',
    to: '/profile'
  }
} 