<!--
LoginView.vue
Component name: LoginView
Description: Login view for authors
Features:
- Email and password form
- Form validation
- Error handling
- Accessibility compliant
Usage:
<template>
  <LoginView />
</template>
Props:
- None
Events:
- None
Accessibility:
- Proper form structure
- ARIA labels
- Error announcements
- Keyboard navigation
-->
<template>
  <div class="author-login">
    <div class="author-login__container">
      <h1 class="author-login__title">Author Login</h1>
      
      <form @submit.prevent="handleSubmit" class="author-login__form">
        <div class="author-login__form-group">
          <label for="email" class="author-login__label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="author-login__input"
            :class="{ 'author-login__input--error': errors.email }"
            required
            aria-required="true"
            :aria-invalid="!!errors.email"
            aria-describedby="email-error"
          />
          <div v-if="errors.email" id="email-error" class="author-login__error">
            {{ errors.email }}
          </div>
        </div>

        <div class="author-login__form-group">
          <label for="password" class="author-login__label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="author-login__input"
            :class="{ 'author-login__input--error': errors.password }"
            required
            aria-required="true"
            :aria-invalid="!!errors.password"
            aria-describedby="password-error"
          />
          <div v-if="errors.password" id="password-error" class="author-login__error">
            {{ errors.password }}
          </div>
        </div>

        <div v-if="error" class="author-login__error author-login__error--general">
          {{ error }}
        </div>

        <button
          type="submit"
          class="author-login__button"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthorStore } from '@/stores/author';

const router = useRouter();
const authStore = useAuthorStore();

const form = reactive({
  email: '',
  password: '',
});

const errors = reactive({
  email: '',
  password: '',
});

const error = ref('');
const isSubmitting = ref(false);

const validateForm = () => {
  let isValid = true;
  errors.email = '';
  errors.password = '';

  if (!form.email) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  if (!form.password) {
    errors.password = 'Password is required';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  error.value = '';

  try {
    const success = await authStore.login(form.email, form.password);
    if (success) {
      router.push('/author');
    } else {
      error.value = 'Invalid email or password';
    }
  } catch (err) {
    error.value = 'An error occurred during login. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.author-login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-background);
}

.author-login__container {
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-xl);
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-md);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.author-login__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.author-login__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.author-login__form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.author-login__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.author-login__input {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-md);
  color: var(--color-text);
  background-color: var(--color-background);
  transition: border-color 0.2s ease;
}

.author-login__input:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

.author-login__input--error {
  border-color: var(--color-danger);
}

.author-login__error {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
}

.author-login__error--general {
  text-align: center;
  margin-top: var(--spacing-sm);
}

.author-login__button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.author-login__button:hover {
  background-color: var(--color-primary-600);
}

.author-login__button:disabled {
  background-color: var(--color-background-muted);
  cursor: not-allowed;
}
</style> 