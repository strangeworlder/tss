<!--
RegisterForm Component

An organism component that handles user registration functionality.
Composes atomic and molecular components to create a complete registration form.

Features:
- First name, last name, email, and password input fields
- Form validation
- Error handling
- Loading states
- Success message display
- Semantic styling
- Accessible form controls

Props:
| Name        | Type     | Default  | Description                    |
|-------------|----------|----------|--------------------------------|
| maxWidth    | string   | '480px'  | Maximum width of the form      |

Events:
| Name        | Parameters | Description                    |
|-------------|------------|--------------------------------|
| success     | user       | Emitted when registration succeeds |
| error       | error      | Emitted when registration fails |

Usage:
<RegisterForm 
  maxWidth="600px"
  @success="handleRegistrationSuccess" 
  @error="handleRegistrationError"
/>
-->

<template>
  <div class="register-form" :style="{ maxWidth }">
    <h2 class="register-form__title">Create an Account</h2>
    <form @submit.prevent="handleSubmit" class="register-form__form">
      <FormGroup
        id="firstName"
        label="First Name"
        type="text"
        v-model="formData.firstName"
        :error="errors.firstName"
        required
      />

      <FormGroup
        id="lastName"
        label="Last Name"
        type="text"
        v-model="formData.lastName"
        :error="errors.lastName"
        required
      />

      <FormGroup
        id="email"
        label="Email"
        type="email"
        v-model="formData.email"
        :error="errors.email"
        required
      />

      <FormGroup
        id="password"
        label="Password"
        type="password"
        v-model="formData.password"
        :error="errors.password"
        required
      />

      <div class="register-form__actions">
        <Button 
          type="submit" 
          :variant="ButtonVariantEnum.PRIMARY" 
          :disabled="isLoading"
        >
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </Button>
        
        <FormError 
          v-if="errorMessage" 
          :message="errorMessage" 
        />
        
        <p 
          v-if="successMessage" 
          class="register-form__success"
        >
          {{ successMessage }}
        </p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import Button from '@/components/atoms/Button.vue';
import FormGroup from '@/components/molecules/FormGroup.vue';
import FormError from '@/components/atoms/FormError.vue';
import { ButtonVariantEnum } from '@/types/button';

interface IRegisterFormProps {
  maxWidth?: string;
}

interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const props = withDefaults(defineProps<IRegisterFormProps>(), {
  maxWidth: '480px',
});

const emit = defineEmits<{
  (e: 'success', user: IUser): void;
  (e: 'error', error: Error): void;
}>();

// Form data
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
});

// Form state
const isLoading = ref(false);
const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
});
const successMessage = ref('');
const errorMessage = ref('');

// Validation function
const validateForm = (): boolean => {
  let isValid = true;

  // Reset errors
  errors.firstName = '';
  errors.lastName = '';
  errors.email = '';
  errors.password = '';
  errorMessage.value = '';

  // Validate first name
  if (!formData.firstName.trim()) {
    errors.firstName = 'First name is required';
    isValid = false;
  }

  // Validate last name
  if (!formData.lastName.trim()) {
    errors.lastName = 'Last name is required';
    isValid = false;
  }

  // Validate email
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Validate password
  if (!formData.password.trim()) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
    isValid = false;
  }

  return isValid;
};

// Submit handler
const handleSubmit = async (): Promise<void> => {
  // Validate form
  if (!validateForm()) {
    return;
  }

  // Start loading
  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    // Call API
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to register');
    }

    // Show success message
    successMessage.value = 'Account created successfully!';

    // Emit success event with user data
    emit('success', data.user);

    // Reset form
    formData.firstName = '';
    formData.lastName = '';
    formData.email = '';
    formData.password = '';
  } catch (error) {
    // Show error message
    const errorObj = error instanceof Error ? error : new Error('An error occurred');
    errorMessage.value = errorObj.message;

    // Emit error event
    emit('error', errorObj);
  } finally {
    // End loading
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-form {
  margin: 0 auto;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  background-color: var(--color-background-alt);
  box-shadow: 0 4px 6px var(--color-background-overlay);
}

.register-form__title {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.register-form__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.register-form__actions {
  margin-top: var(--spacing-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.register-form__success {
  color: var(--color-success);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-sm);
  text-align: center;
}
</style> 