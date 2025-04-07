import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp, ref } from 'vue'
import ReadMoreButton from '../ReadMoreButton.vue'

describe('ReadMoreButton E2E', () => {
  it('navigates to the correct route when clicked', async () => {
    // Create a test app with the ReadMoreButton component
    const app = createApp({
      template: `
        <div>
          <ReadMoreButton :to="targetRoute" />
          <div v-if="currentRoute === targetRoute" data-testid="target-page">
            Target Page Content
          </div>
        </div>
      `,
      setup() {
        const targetRoute = '/blog/post-1'
        const currentRoute = ref('')

        // Mock router navigation
        const navigate = (route: string) => {
          currentRoute.value = route
        }

        return { targetRoute, currentRoute, navigate }
      },
    })

    app.component('ReadMoreButton', ReadMoreButton)

    // Mock the router-link component
    app.component('router-link', {
      template: '<a @click="$emit(\'click\')"><slot /></a>',
      props: ['to'],
    })

    // Mount the app
    const wrapper = mount(app)

    // Check that the target page is not visible initially
    expect(wrapper.find('[data-testid="target-page"]').exists()).toBe(false)

    // Click the read more button
    await wrapper.find('.button').trigger('click')

    // Check that the target page is now visible
    expect(wrapper.find('[data-testid="target-page"]').exists()).toBe(true)
  })
})
