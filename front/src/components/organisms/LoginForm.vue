<!--
LoginForm Component

An organism component that handles user login functionality.
Composes atomic and molecular components to create a complete login form.

Features:
- Email and password input fields
- Form validation
- Error handling
- Loading states
- Semantic styling
- Accessible form controls

Usage:
<LoginForm @success="handleLoginSuccess" />
-->

<template>
  <div class="login-form">
    <h2 class="login-form__title">Login to Your Account</h2>
    <form @submit.prevent="handleSubmit" class="login-form__form">
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

      <div class="login-form__actions">
        <Button type="submit" :variant="ButtonVariantEnum.PRIMARY" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </Button>
        <FormError :message="errorMessage" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/atoms/Button.vue'
import FormGroup from '@/components/molecules/FormGroup.vue'
import FormError from '@/components/atoms/FormError.vue'
import { ButtonVariantEnum } from '@/types/button'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const formData = reactive({
  email: '',
  password: '',
})

// Form state
const isLoading = ref(false)
const errors = reactive({
  email: '',
  password: '',
})
const errorMessage = ref('')

// Validation function
const validateForm = (): boolean => {
  let isValid = true

  // Reset errors
  errors.email = ''
  errors.password = ''
  errorMessage.value = ''

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
  }

  return isValid
}

// Submit handler
const handleSubmit = async (): Promise<void> => {
  // Validate form
  if (!validateForm()) {
    return
  }

  // Start loading
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Call API
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to login')
    }

    // Store token and user data
    authStore.setAuthData(data.user, data.token)

    // Redirect to home
    router.push('/')
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
.login-form {
  max-width: 480px;
  margin: 0 auto;
  padding: var(--spacing-8);
  border-radius: var(--border-radius);
  background-color: var(--color-background-soft);
  box-shadow: 0 4px 6px var(--color-shadow);
}

.login-form__title {
  text-align: center;
  margin-bottom: var(--spacing-6);
  color: var(--color-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

.login-form__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.login-form__actions {
  margin-top: var(--spacing-6);
  text-align: center;
}
</style>
