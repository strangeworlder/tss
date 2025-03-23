<template>
  <div class="register-form">
    <h2>Create an Account</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group" :class="{ 'error': errors.firstName }">
        <label for="firstName">First Name</label>
        <input 
          type="text" 
          id="firstName" 
          v-model="formData.firstName" 
          required
        />
        <p v-if="errors.firstName" class="error-message">{{ errors.firstName }}</p>
      </div>
      
      <div class="form-group" :class="{ 'error': errors.lastName }">
        <label for="lastName">Last Name</label>
        <input 
          type="text" 
          id="lastName" 
          v-model="formData.lastName" 
          required
        />
        <p v-if="errors.lastName" class="error-message">{{ errors.lastName }}</p>
      </div>

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
        <button type="submit" class="btn-register" :disabled="isLoading">
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

// Form data
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
});

// Form state
const isLoading = ref(false);
const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
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
const handleSubmit = async () => {
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
    const response = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to register');
    }
    
    // Show success message
    successMessage.value = 'Account created successfully!';
    
    // Reset form
    formData.firstName = '';
    formData.lastName = '';
    formData.email = '';
    formData.password = '';
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
.register-form {
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

.success-message {
  color: #4caf50;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
}

.form-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-register {
  background-color: #4caf50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-register:hover {
  background-color: #43a047;
}

.btn-register:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}
</style> 