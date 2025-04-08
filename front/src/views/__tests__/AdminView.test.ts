import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AdminView from '../AdminView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import { useBlogStore } from '@/stores/blogStore';

// Mock child components
vi.mock('@/components/organisms/admin/BlogPostList.vue', () => ({
  default: {
    name: 'BlogPostList',
    template: '<div class="mock-blog-post-list">Blog Post List</div>',
    emits: ['edit-post'],
  },
}));

vi.mock('@/components/organisms/admin/BlogPostEditor.vue', () => ({
  default: {
    name: 'BlogPostEditor',
    template: '<div class="mock-blog-post-editor">Blog Post Editor</div>',
    props: ['postId'],
    emits: ['back'],
  },
}));

vi.mock('@/components/templates/BaseView.vue', () => ({
  default: {
    name: 'BaseView',
    template: '<div class="mock-base-view"><slot name="header" /><slot /></div>',
    props: ['title', 'variant'],
  },
}));

vi.mock('@/components/molecules/Tabs.vue', () => ({
  default: {
    name: 'Tabs',
    template: '<div class="mock-tabs"><slot /></div>',
    props: ['modelValue', 'tabs'],
    emits: ['update:modelValue'],
  },
}));

// Mock router
const mockRouter = {
  push: vi.fn(),
};
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

describe('AdminView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Mock the auth store
    vi.mock('@/stores/authStore', () => ({
      useAuthStore: vi.fn(() => ({
        isAdmin: true,
      })),
    }));
  });

  it('renders correctly', () => {
    const wrapper = mount(AdminView);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.admin-view__title').text()).toBe('Blog Admin');
  });

  it('shows BlogPostList by default', () => {
    const wrapper = mount(AdminView);
    expect(wrapper.find('.mock-blog-post-list').exists()).toBe(true);
    expect(wrapper.find('.mock-blog-post-editor').exists()).toBe(false);
  });

  it('switches to editor when clicking New Post tab', async () => {
    const wrapper = mount(AdminView);
    const tabs = wrapper.findComponent({ name: 'Tabs' });
    await tabs.vm.$emit('update:modelValue', 'editor');

    expect(wrapper.find('.mock-blog-post-editor').exists()).toBe(true);
    expect(wrapper.find('.mock-blog-post-list').exists()).toBe(false);
  });

  it('switches back to list when clicking back in editor', async () => {
    const wrapper = mount(AdminView);
    const tabs = wrapper.findComponent({ name: 'Tabs' });
    await tabs.vm.$emit('update:modelValue', 'editor');
    const editor = wrapper.findComponent({ name: 'BlogPostEditor' });
    await editor.vm.$emit('back');

    expect(wrapper.find('.mock-blog-post-list').exists()).toBe(true);
    expect(wrapper.find('.mock-blog-post-editor').exists()).toBe(false);
  });

  it('redirects to home if user is not admin', () => {
    // Mock the auth store with isAdmin set to false
    vi.mock('@/stores/authStore', () => ({
      useAuthStore: vi.fn(() => ({
        isAdmin: false,
      })),
    }));

    mount(AdminView);
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});
