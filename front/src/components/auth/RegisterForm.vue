<template>
  <div class="register-form">
    <h2>Create an Account</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group" :class="{ error: errors.firstName }">
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" v-model="formData.firstName" required />
        <p v-if="errors.firstName" class="error-message">{{ errors.firstName }}</p>
      </div>

      <div class="form-group" :class="{ error: errors.lastName }">
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" v-model="formData.lastName" required />
        <p v-if="errors.lastName" class="error-message">{{ errors.lastName }}</p>
      </div>

      <div class="form-group" :class="{ error: errors.email }">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="formData.email" required />
        <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
      </div>

      <div class="form-group" :class="{ error: errors.password }">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="formData.password" required />
        <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
      </div>

      <div class="form-actions">
        <Button type="submit" variant="primary" :disabled="isLoading">
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </Button>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Button from '@/components/atoms/Button.vue'

// Form data
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
})

// Form state
const isLoading = ref(false)
const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
})
const successMessage = ref('')
const errorMessage = ref('')

// Validation function
const validateForm = (): boolean => {
  let isValid = true

  // Reset errors
  errors.firstName = ''
  errors.lastName = ''
  errors.email = ''
  errors.password = ''
  errorMessage.value = ''

  // Validate first name
  if (!formData.firstName.trim()) {
    errors.firstName = 'First name is required'
    isValid = false
  }

  // Validate last name
  if (!formData.lastName.trim()) {
    errors.lastName = 'Last name is required'
    isValid = false
  }

  // Validate email
  if (!formData.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Validate password
  if (!formData.password.trim()) {
    errors.password = 'Password is required'
    isValid = false
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long'
    isValid = false
  }

  return isValid
}

// Submit handler
const handleSubmit = async () => {
  // Validate form
  if (!validateForm()) {
    return
  }

  // Start loading
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Call API
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
    const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to register')
    }

    // Show success message
    successMessage.value = 'Account created successfully!'

    // Reset form
    formData.firstName = ''
    formData.lastName = ''
    formData.email = ''
    formData.password = ''
  } catch (error) {
    // Show error message
    errorMessage.value = error instanceof Error ? error.message : 'An error occurred'
  } finally {
    // End loading
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-form {
  max-width: 480px;
  margin: 0 auto;
  padding: var(--spacing-8);
  border-radius: var(--border-radius);
  background-color: var(--color-background-soft);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: var(--spacing-6);
  color: var(--color-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

.form-group {
  margin-bottom: var(--spacing-4);
}

label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

input {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  transition: border-color var(--transition-fast);
  background-color: var(--color-background);
  color: var(--color-text);
}

input:focus {
  outline: none;
  border-color: var(--color-border-hover);
}

.form-group.error input {
  border-color: var(--color-highlight-1);
}

.error-message {
  color: var(--color-highlight-1);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-1);
}

.success-message {
  color: var(--color-highlight-1);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-2);
  text-align: center;
}

.form-actions {
  margin-top: var(--spacing-6);
  text-align: center;
}
</style>
