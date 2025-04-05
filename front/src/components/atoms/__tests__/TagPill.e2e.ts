import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp, ref } from 'vue'
import TagPill from '../TagPill.vue'

describe('TagPill E2E', () => {
  it('integrates correctly with tag filtering system', async () => {
    // Create a test app with the TagPill component
    const app = createApp({
      template: `
        <div>
          <TagPill 
            v-for="tag in tags" 
            :key="tag"
            :tag="tag"
            @click="selectTag(tag)"
          />
          <div v-if="selectedTag" data-testid="filtered-content">
            Showing content for tag: {{ selectedTag }}
          </div>
        </div>
      `,
      setup() {
        const tags = ['vue', 'typescript', 'javascript']
        const selectedTag = ref('')
        
        const selectTag = (tag: string) => {
          selectedTag.value = tag
        }
        
        return { tags, selectedTag, selectTag }
      }
    })
    
    app.component('TagPill', TagPill)
    
    // Mock the router
    const mockRouter = {
      push: vi.fn()
    }
    
    // Mount the app with router mock
    const wrapper = mount(app, {
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    })
    
    // Check that all tags are rendered
    const tagPills = wrapper.findAll('.tag-pill')
    expect(tagPills).toHaveLength(3)
    
    // Click the first tag
    await tagPills[0].trigger('click')
    
    // Check that the filtered content is shown
    const filteredContent = wrapper.find('[data-testid="filtered-content"]')
    expect(filteredContent.exists()).toBe(true)
    expect(filteredContent.text()).toContain('vue')
  })

  it('supports keyboard navigation', async () => {
    // Create a test app with the TagPill component
    const app = createApp({
      template: `
        <div>
          <TagPill 
            v-for="tag in tags" 
            :key="tag"
            :tag="tag"
            @click="selectTag(tag)"
          />
          <div v-if="selectedTag" data-testid="filtered-content">
            Showing content for tag: {{ selectedTag }}
          </div>
        </div>
      `,
      setup() {
        const tags = ['vue', 'typescript', 'javascript']
        const selectedTag = ref('')
        
        const selectTag = (tag: string) => {
          selectedTag.value = tag
        }
        
        return { tags, selectedTag, selectTag }
      }
    })
    
    app.component('TagPill', TagPill)
    
    // Mock the router
    const mockRouter = {
      push: vi.fn()
    }
    
    // Mount the app with router mock
    const wrapper = mount(app, {
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    })
    
    // Focus the first tag
    const firstTag = wrapper.find('.tag-pill')
    await firstTag.trigger('focus')
    
    // Press Enter
    await firstTag.trigger('keydown.enter')
    
    // Check that the filtered content is shown
    const filteredContent = wrapper.find('[data-testid="filtered-content"]')
    expect(filteredContent.exists()).toBe(true)
    expect(filteredContent.text()).toContain('vue')
  })
}) 