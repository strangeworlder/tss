<template>
  <div class="login-form">
    <h2>Login to Your Account</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group" :class="{ 'error': errors.email }">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="formData.email" 
          required
        />
        <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
      </div>

      <div class="form-group" :class="{ 'error': errors.password }">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="formData.password" 
          required
        />
        <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-login" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

// Form data
const formData = reactive({
  email: '',
  password: ''
});

// Form state
const isLoading = ref(false);
const errors = reactive({
  email: '',
  password: ''
});
const errorMessage = ref('');

// Validation function
const validateForm = (): boolean => {
  let isValid = true;
  
  // Reset errors
  errors.email = '';
  errors.password = '';
  errorMessage.value = '';
  
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
  }
  
  return isValid;
};

// Submit handler
const handleSubmit = async () => {
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Start loading
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    // Call API
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to login');
    }
    
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect to dashboard or home page
    // In a real app, you might use Vue Router here
    window.location.href = '/';
  } catch (error) {
    // Show error message
    errorMessage.value = error instanceof Error ? error.message : 'An error occurred';
  } finally {
    // End loading
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-form {
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group.error input {
  border-color: #e53935;
}

.error-message {
  color: #e53935;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.form-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-login {
  background-color: #2196f3;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-login:hover {
  background-color: #1976d2;
}

.btn-login:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}
</style> 