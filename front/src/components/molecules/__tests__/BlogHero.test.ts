import { describe, it, expect } from 'vitest';
import { mountBlogHero } from './BlogHero.test-utils';
import { mockBlogHeroes } from '@/components/molecules/__tests__/__fixtures__/BlogHero.fixture';
import AppImage from '@/components/atoms/AppImage.vue';
import { ImageSizeEnum } from '@/types/image';

describe('BlogHero', () => {
  // 1. Rendering tests
  it('renders correctly with default props', () => {
    const wrapper = mountBlogHero();

    // Check if the component renders
    expect(wrapper.exists()).toBe(true);

    // Check if AppImage is rendered with correct props
    const appImage = wrapper.findComponent(AppImage);
    expect(appImage.exists()).toBe(true);
    expect(appImage.props('filename')).toBe(mockBlogHeroes.default.heroImage);
    expect(appImage.props('size')).toBe(ImageSizeEnum.FULL);
    expect(appImage.props('alt')).toBe(mockBlogHeroes.default.altText);

    // Check if content div exists
    const contentDiv = wrapper.find('.blog-hero__content');
    expect(contentDiv.exists()).toBe(true);
  });

  // 2. Props tests
  it('renders with custom alt text', () => {
    const wrapper = mountBlogHero(mockBlogHeroes.customAltText);

    const appImage = wrapper.findComponent(AppImage);
    expect(appImage.props('alt')).toBe(mockBlogHeroes.customAltText.altText);
  });

  it('renders with custom image', () => {
    const wrapper = mountBlogHero(mockBlogHeroes.customImage);

    const appImage = wrapper.findComponent(AppImage);
    expect(appImage.props('filename')).toBe(mockBlogHeroes.customImage.heroImage);
  });

  // 3. Slot content tests
  it('renders slot content correctly', () => {
    const slotContent = '<h1>Test Title</h1><p>Test content</p>';
    const wrapper = mountBlogHero(mockBlogHeroes.default, {
      slots: {
        default: slotContent,
      },
    });

    const contentDiv = wrapper.find('.blog-hero__content');
    expect(contentDiv.html()).toContain(slotContent);
  });

  // 4. Styling tests
  it('has correct CSS classes and styling', () => {
    const wrapper = mountBlogHero();

    // Check if the main container has the correct class
    const mainContainer = wrapper.find('.blog-hero');
    expect(mainContainer.exists()).toBe(true);

    // Check if the image has the correct class
    const image = wrapper.find('.blog-hero__image');
    expect(image.exists()).toBe(true);

    // Check if the content has the correct class
    const content = wrapper.find('.blog-hero__content');
    expect(content.exists()).toBe(true);
  });

  // 5. Accessibility tests
  it('is accessible', () => {
    const wrapper = mountBlogHero();

    // Check if the image has alt text
    const appImage = wrapper.findComponent(AppImage);
    expect(appImage.props('alt')).toBeTruthy();

    // Check if the content is properly structured
    const contentDiv = wrapper.find('.blog-hero__content');
    expect(contentDiv.exists()).toBe(true);
  });

  // 6. Responsive behavior tests
  it('handles responsive behavior', () => {
    const wrapper = mountBlogHero();

    // Check if the component has responsive styling
    const mainContainer = wrapper.find('.blog-hero');
    expect(mainContainer.attributes('style')).toBeDefined();
  });
});
