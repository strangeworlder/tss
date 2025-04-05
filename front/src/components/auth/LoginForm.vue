<template>
  <div class="login-form">
    <h2>Login to Your Account</h2>
    <form @submit.prevent="handleSubmit">
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
        <Button type="submit" :variant="ButtonVariantEnum.PRIMARY" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </Button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/atoms/Button.vue'
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
const handleSubmit = async () => {
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

.form-actions {
  margin-top: var(--spacing-6);
  text-align: center;
}

/* Remove the old button styles since we're using the Button atom */
</style>
