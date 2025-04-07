import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RegisterForm from '../RegisterForm.vue';
import type { IUser } from '@/types/user';
import { UserRole } from '@/types/user';

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register form with all required fields', () => {
    const wrapper = mount(RegisterForm);

    expect(wrapper.find('h2').text()).toBe('Create an Account');
    expect(wrapper.findAllComponents({ name: 'FormGroup' })).toHaveLength(4);
  });

  it('accepts maxWidth prop and applies it correctly', () => {
    const wrapper = mount(RegisterForm, {
      props: {
        maxWidth: '600px',
      },
    });

    expect(wrapper.find('.register-form').attributes('style')).toContain('maxWidth: 600px');
  });

  it('validates first name field', async () => {
    const wrapper = mount(RegisterForm);

    // Test empty first name
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true);

    // Test valid first name
    await wrapper.find('input[id="firstName"]').setValue('John');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true); // Still true because other fields are empty
  });

  it('validates last name field', async () => {
    const wrapper = mount(RegisterForm);

    // Test empty last name
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true);

    // Test valid last name
    await wrapper.find('input[id="lastName"]').setValue('Doe');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true); // Still true because other fields are empty
  });

  it('validates email field', async () => {
    const wrapper = mount(RegisterForm);

    // Test empty email
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true);

    // Test invalid email
    await wrapper.find('input[type="email"]').setValue('invalid-email');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true);

    // Test valid email
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true); // Still true because other fields are empty
  });

  it('validates password field', async () => {
    const wrapper = mount(RegisterForm);

    // Test empty password
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true);

    // Test short password
    await wrapper.find('input[type="password"]').setValue('short');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true);

    // Test valid password
    await wrapper.find('input[type="password"]').setValue('password123');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.input-field--error').exists()).toBe(true); // Still true because other fields are empty
  });

  it('validates all fields together', async () => {
    const wrapper = mount(RegisterForm);

    // Fill all fields with valid data
    await wrapper.find('input[id="firstName"]').setValue('John');
    await wrapper.find('input[id="lastName"]').setValue('Doe');
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');

    // Submit form
    await wrapper.find('form').trigger('submit');

    // No validation errors should be shown
    expect(wrapper.find('.input-field--error').exists()).toBe(false);
  });

  it('handles successful registration', async () => {
    const wrapper = mount(RegisterForm);
    const mockUser: IUser = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      role: UserRole.USER,
    };

    // Mock successful API response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          user: mockUser,
          token: 'test-token',
        }),
    });

    // Fill form with valid data
    await wrapper.find('input[id="firstName"]').setValue('John');
    await wrapper.find('input[id="lastName"]').setValue('Doe');
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');

    // Submit form
    await wrapper.find('form').trigger('submit');

    // Wait for async operations to complete
    await wrapper.vm.$nextTick();

    // Verify success message is displayed
    expect(wrapper.find('.register-form__success').text()).toBe('Account created successfully!');

    // Verify success event was emitted with user data
    expect(wrapper.emitted('success')).toBeTruthy();
    expect(wrapper.emitted('success')?.[0][0] as IUser).toEqual(mockUser);
  });

  it('handles registration error', async () => {
    const wrapper = mount(RegisterForm);
    const errorMessage = 'Email already in use';

    // Mock failed API response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          message: errorMessage,
        }),
    });

    // Fill form with valid data
    await wrapper.find('input[id="firstName"]').setValue('John');
    await wrapper.find('input[id="lastName"]').setValue('Doe');
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');

    // Submit form
    await wrapper.find('form').trigger('submit');

    // Wait for async operations to complete
    await wrapper.vm.$nextTick();

    // Verify error message is displayed
    expect(wrapper.find('.form-error').text()).toBe(errorMessage);

    // Verify error event was emitted
    expect(wrapper.emitted('error')).toBeTruthy();
    const errorEvent = wrapper.emitted('error')?.[0][0] as Error;
    expect(errorEvent.message).toBe(errorMessage);
  });

  it('shows loading state during submission', async () => {
    const wrapper = mount(RegisterForm);

    // Mock delayed API response
    global.fetch = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    // Fill form with valid data
    await wrapper.find('input[id="firstName"]').setValue('John');
    await wrapper.find('input[id="lastName"]').setValue('Doe');
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');

    // Submit form
    await wrapper.find('form').trigger('submit');

    // Verify loading state
    expect(wrapper.find('button').text()).toBe('Creating Account...');
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
